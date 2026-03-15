import { z } from 'zod';

export const philTVApiParamsSchemas = z.object({
  apiUrl: z.url(),
  user: z.string().min(1),
  password: z.string().min(1),
});
