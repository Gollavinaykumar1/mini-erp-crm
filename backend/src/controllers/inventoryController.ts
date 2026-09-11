import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { stockMovementSchema } from '../validators/inventoryValidators';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productId = req.query.productId as string;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.StockMovementWhereInput = productId ? { productId } : {};

    const [movements, total] = await prisma.$transaction([
      prisma.stockMovement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, productName: true, sku: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.stockMovement.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        movements,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createStockMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = stockMovementSchema.parse(req.body);
    
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new Error('Product not found');
      }

      let newStock = product.currentStock;
      if (data.movementType === 'IN') {
        newStock += data.quantity;
      } else {
        newStock -= data.quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock for this OUT movement');
        }
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          movementType: data.movementType,
          reason: data.reason,
          createdBy: req.user!.userId
        }
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock }
      });

      return movement;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Insufficient stock for this OUT movement') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
