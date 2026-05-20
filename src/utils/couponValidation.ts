import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const couponFormSchema = z.object({
  bonus: z.boolean(),
  mealImage: z.object({ uri: z.string().min(1) }).optional(),
  restaurantLogo: z.object({ uri: z.string().min(1) }).optional(),
  restaurant: z.string().trim().min(1, 'Informe o restaurante.'),
  restaurantURL: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/\S+\.\S+/.test(value),
      'Informe uma URL valida iniciando com http:// ou https://.',
    ),
  description: z.string().trim().min(1, 'Informe a promocao.'),
  opening: z
    .string()
    .trim()
    .regex(timeRegex, 'Use o formato HH:MM para abertura.'),
  close: z.string().trim().regex(timeRegex, 'Use o formato HH:MM para fechamento.'),
});
