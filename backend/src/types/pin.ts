import { z } from 'zod';

export const PinSchema = z.object({
  id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  story: z.string().min(1).max(200),
  placeName: z.string().min(1).max(100),
  imagePath: z.string().optional(),
  timestamp: z.date()
});

export const CreatePinSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  story: z.string().min(1).max(200),
  placeName: z.string().min(1).max(100),
  imagePath: z.string().optional()
});

export type Pin = z.infer<typeof PinSchema>;
export type CreatePinRequest = z.infer<typeof CreatePinSchema>;

