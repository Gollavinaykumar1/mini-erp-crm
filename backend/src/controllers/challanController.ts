import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, ChallanStatus } from '@prisma/client';
import { createChallanSchema } from '../validators/challanValidators';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Helper to generate next challan number (simplified)
const generateChallanNumber = async (tx: Prisma.TransactionClient) => {
  const currentYear = new Date().getFullYear();
  const lastChallan = await tx.challan.findFirst({
    where: { challanNumber: { startsWith: `CH-${currentYear}-` } },
    orderBy: { challanNumber: 'desc' }
  });

  let nextNum = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }
  return `CH-${currentYear}-${nextNum.toString().padStart(5, '0')}`;
};

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as ChallanStatus | undefined;
    const customerId = req.query.customerId as string | undefined;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.ChallanWhereInput = {};
    if (status) whereClause.status = status;
    if (customerId) whereClause.customerId = customerId;

    const [challans, total] = await prisma.$transaction([
      prisma.challan.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, businessName: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.challan.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        challans,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        user: { select: { name: true } }
      }
    });

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    res.json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createChallanSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Validate customer
      const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) throw new Error('Customer not found');

      let totalQuantity = 0;
      const challanItemsData = [];

      // Validate products and prepare snapshot
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);

        totalQuantity += item.quantity;
        challanItemsData.push({
          productId: product.id,
          productName: product.productName,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity
        });
      }

      const challanNumber = await generateChallanNumber(tx as Prisma.TransactionClient);

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          totalQuantity,
          status: ChallanStatus.DRAFT,
          createdBy: req.user!.userId,
          items: {
            create: challanItemsData
          }
        },
        include: { items: true }
      });

      return challan;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challanId = req.params.id;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      });

      if (!challan) throw new Error('Challan not found');
      if (challan.status !== ChallanStatus.DRAFT) {
        throw new Error(`Cannot confirm challan. Current status is ${challan.status}`);
      }

      // Check stock for all items
      for (const item of challan.items) {
        if (item.quantity <= 0) throw new Error(`Invalid quantity ${item.quantity} for item ${item.productName}`);

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productName} no longer exists`);

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }
      }

      // If we reach here, all products have sufficient stock. Proceed with deductions.
      for (const item of challan.items) {
        // Create OUT movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Challan Confirmation: ${challan.challanNumber}`,
            createdBy: req.user!.userId
          }
        });

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Update challan status
      const updatedChallan = await tx.challan.update({
        where: { id: challan.id },
        data: { status: ChallanStatus.CONFIRMED }
      });

      return updatedChallan;
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('Insufficient stock') || error.message.includes('Cannot confirm') || error.message.includes('Invalid quantity')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challanId = req.params.id;
    
    // Simplistic cancel logic: only drafts can be cancelled, or you need complex reversal logic.
    // The requirement didn't specify reversing stock for confirmed challans, so let's just allow cancelling drafts.
    const challan = await prisma.challan.findUnique({ where: { id: challanId } });
    
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    
    if (challan.status !== ChallanStatus.DRAFT) {
       return res.status(400).json({ success: false, message: 'Only DRAFT challans can be cancelled without stock reversal.' });
    }

    const updated = await prisma.challan.update({
      where: { id: challanId },
      data: { status: ChallanStatus.CANCELLED }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
