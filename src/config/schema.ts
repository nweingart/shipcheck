import { z } from 'zod';

const severitySchema = z.enum(['error', 'warning', 'info']);

const ruleOverrideSchema = z.object({
  enabled: z.boolean().optional(),
  severity: severitySchema.optional(),
});

export const configSchema = z.object({
  iosDir: z.string().optional(),
  rules: z.record(z.string(), ruleOverrideSchema).optional(),
  agent: z.enum(['claude', 'codex', 'auto']).optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
}).strict();

export type ValidatedConfig = z.infer<typeof configSchema>;
