/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from './services/api/src/index.ts';
import { loadAndValidateConfig, APP_METADATA } from './packages/config/src/index.ts';

async function startServer() {
  console.log(`[RepoPilot AI] Starting ${APP_METADATA.name} (${APP_METADATA.phase})...`);

  // Validate configuration at startup
  const configCheck = loadAndValidateConfig();
  if (!configCheck.success) {
    console.warn('[RepoPilot Config Warning] Missing or invalid configuration:', configCheck.errors);
  } else {
    console.log('[RepoPilot Config] Environment validated successfully:', {
      nodeEnv: configCheck.config?.NODE_ENV,
      port: configCheck.config?.PORT,
      ciUrl: configCheck.config?.CODE_INTELLIGENCE_URL,
    });
  }

  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Mount API backend router under /api
  const apiApp = createApiApp();
  app.use(apiApp);

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[RepoPilot AI] Server ready on http://0.0.0.0:${port}`);
    console.log(`[RepoPilot AI] API Health Check: http://0.0.0.0:${port}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[RepoPilot AI] Server startup failure:', err);
  process.exit(1);
});
