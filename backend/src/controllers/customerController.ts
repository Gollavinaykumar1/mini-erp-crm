import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { createCustomerSchema, updateCustomerSchema, addFollowupSchema } from '../validators/customerValidators';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    const whereClause: Prisma.CustomerWhereInput = search ? {
      OR: [
        { customerName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        customers,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        followups: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCustomerSchema.parse(req.body);
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, data: customer });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    next(error);
  }
};

export const addFollowup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = addFollowupSchema.parse(req.body);
    const followup = await prisma.followup.create({
      data: {
        customerId: req.params.id,
        note: data.note,
        followUpDate: new Date(data.followUpDate),
        createdBy: req.user!.userId
      }
    });

    // Update customer followUpDate
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { followUpDate: new Date(data.followUpDate) }
    });

    res.status(201).json({ success: true, data: followup });
  } catch (error) {
    next(error);
  }
};
