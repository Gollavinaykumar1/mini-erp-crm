import { z } from 'zod';

export const createChallanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(createChallanItemSchema).min(1, 'At least one item is required')
});
