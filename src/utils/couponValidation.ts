import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const couponImageSchema = z.union([
  z.object({ uri: z.string().min(1) }),
  z.number(),
]);

export const couponFormSchema = z.object({
  bonus: z.boolean(),
  mealImage: couponImageSchema.optional(),
  restaurantLogo: couponImageSchema.optional(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim(),
  opening: z
    .string()
    .trim()
    .regex(timeRegex, 'Use o formato HH:MM para abertura.'),
  close: z
    .string()
    .trim()
    .regex(timeRegex, 'Use o formato HH:MM para fechamento.'),
});
