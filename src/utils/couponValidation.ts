import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const couponFormSchema = z.object({
  bonus: z.boolean(),
  mealImage: z.object({ uri: z.string().min(1) }).optional(),
  restaurantLogo: z.object({ uri: z.string().min(1) }).optional(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim(),
  opening: z
    .string()
    .trim()
    .regex(timeRegex, 'Use o formato HH:MM para abertura.'),
  close: z.string().trim().regex(timeRegex, 'Use o formato HH:MM para fechamento.'),
});
