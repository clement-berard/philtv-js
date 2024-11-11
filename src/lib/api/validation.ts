import { z } from 'zod';

export const setBrightnessParamsSchema = z.union([
  z.coerce.number().min(0).max(10),
  z.enum(['increase', 'decrease'] as const),
]);
export type SetBrightnessParams = z.infer<typeof setBrightnessParamsSchema>;
