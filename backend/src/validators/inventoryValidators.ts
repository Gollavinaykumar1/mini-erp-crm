import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(1).optional()
});
