import { z } from 'zod';

export const couponFormSchema = z.object({
  title: z.string().trim().min(1, 'Informe o titulo do cupom.'),
  description: z.string().trim().optional(),
});
