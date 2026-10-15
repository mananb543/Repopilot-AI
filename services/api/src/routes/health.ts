/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { ServiceHealthStatus } from '@repopilot/shared-types';
import { APP_METADATA } from '@repopilot/config';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  // Probe Code Intelligence service if configured
  const codeIntelligenceUrl = process.env.CODE_INTELLIGENCE_URL || 'http://127.0.0.1:8000';
  let ciStatus: 'online' | 'offline' | 'unreachable' = 'offline';
  let ciLatency = 0;

  try {
    const ciStart = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    const ciRes = await fetch(`${codeIntelligenceUrl}/health`, {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (ciRes && ciRes.ok) {
      ciStatus = 'online';
      ciLatency = Date.now() - ciStart;
    } else {
      ciStatus = 'offline';
    }
  } catch {
    ciStatus = 'offline';
  }

  const health: ServiceHealthStatus = {
    status: 'ok',
    service: 'repopilot-api',
    version: APP_METADATA.version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds,
    components: {
      database: {
        status: process.env.DATABASE_URL ? 'connected' : 'unconfigured',
        message: process.env.DATABASE_URL 
          ? 'PostgreSQL configured' 
          : 'In-memory state active (PostgreSQL with pgvector planned for Phase 2)',
      },
      codeIntelligence: {
        status: ciStatus,
        endpoint: codeIntelligenceUrl,
        latencyMs: ciLatency,
      },
      agentWorker: {
        status: 'idle',
      },
    },
  };

  res.json(health);
});
