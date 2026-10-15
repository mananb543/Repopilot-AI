/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Express } from 'express';
import { healthRouter } from './routes/health.js';
import { repositoriesRouter } from './routes/repositories.js';
import { tasksRouter } from './routes/tasks.js';
import { configRouter } from './routes/config.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApiApp(): Express {
  const app = express();

  app.use(express.json());

  // Mount API endpoints
  app.use('/api/health', healthRouter);
  app.use('/api/repositories', repositoriesRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/config-status', configRouter);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export { healthRouter, repositoriesRouter, tasksRouter, configRouter, errorHandler };
