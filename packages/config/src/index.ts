/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const ApiConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  CODE_INTELLIGENCE_URL: z.string().url().default('http://127.0.0.1:8000'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

export function loadAndValidateConfig(env: Record<string, string | undefined> = process.env): {
  success: boolean;
  config?: ApiConfig;
  errors?: string[];
} {
  const result = ApiConfigSchema.safeParse(env);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`),
    };
  }
  return {
    success: true,
    config: result.data,
  };
}

export const APP_METADATA = {
  name: 'RepoPilot AI',
  version: '0.1.0-phase1',
  description: 'Autonomous software engineering agent and code intelligence platform foundation',
  phase: 'Phase 1: Project Foundation and Architecture',
} as const;
