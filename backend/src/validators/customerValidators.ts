import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  customerName: z.string().min(1),
  mobileNumber: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().min(1),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE)
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addFollowupSchema = z.object({
  note: z.string().min(1),
  followUpDate: z.string().datetime()
});
