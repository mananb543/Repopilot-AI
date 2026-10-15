/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    providers: {
      gemini: {
        configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
        model: 'gemini-2.5-pro / gemini-2.5-flash',
      },
      anthropic: {
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        model: 'claude-3-7-sonnet',
      },
      openai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: 'gpt-4o',
      },
    },
    integrations: {
      codeIntelligenceService: {
        endpoint: process.env.CODE_INTELLIGENCE_URL || 'http://127.0.0.1:8000',
        active: true,
      },
      postgresPgvector: {
        configured: Boolean(process.env.DATABASE_URL),
        active: false,
        note: 'Planned for Phase 2 semantic retrieval',
      },
      redisQueue: {
        configured: Boolean(process.env.REDIS_URL),
        active: false,
        note: 'Planned for Phase 3 background agent workers',
      },
      dockerExecutionSandbox: {
        available: false,
        note: 'Container execution sandbox planned for Phase 4 safe test running',
      },
    },
    security: {
      arbitraryShellExecution: 'disabled',
      sandboxedMode: 'enforced',
      phase: 1,
    },
  });
});
