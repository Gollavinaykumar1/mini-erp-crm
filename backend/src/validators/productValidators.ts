import { z } from 'zod';

export const createProductSchema = z.object({
  productName: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.number().min(0),
  currentStock: z.number().min(0).default(0),
  minimumStock: z.number().min(0).default(0),
  warehouseLocation: z.string().min(1)
});

export const updateProductSchema = createProductSchema.partial();
