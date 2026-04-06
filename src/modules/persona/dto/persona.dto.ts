import { z } from 'zod';

export const createPersonaSchema = z.object({
  name: z.string().min(2),
  tone: z.string().min(2),
  aggressiveness: z.number().int().min(0).max(10),
  emojiUsage: z.number().int().min(0).max(10),
  argumentStyle: z.string().min(2),
  systemPrompt: z.string().min(10)
});

export type CreatePersonaDto = z.infer<typeof createPersonaSchema>;
