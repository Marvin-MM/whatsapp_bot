import { z } from 'zod';

export const toggleAgentSchema = z.object({
  enabled: z.boolean()
});

export const updateConfigSchema = z.object({
  maxMessagesPerHour: z.number().int().min(1).max(500).optional(),
  minDelayMs: z.number().int().min(100).max(30000).optional(),
  maxDelayMs: z.number().int().min(100).max(60000).optional(),
  antiBanSleepCycleMins: z.number().int().min(0).max(180).optional()
});

export const assignChatSchema = z.object({
  chatWaId: z.string().min(3),
  personaId: z.string().min(3)
});
