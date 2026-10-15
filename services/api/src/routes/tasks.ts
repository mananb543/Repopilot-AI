/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { 
  AgentTask, 
  CreateTaskSchema,
} from '@repopilot/shared-types';

export const tasksRouter = Router();

// In-memory tasks store for Phase 1
const tasksStore: AgentTask[] = [
  {
    id: 'task-initial-1',
    repositoryId: 'repo-sample-1',
    title: 'Audit TypeScript definitions and export contracts',
    description: 'Inspect type definitions in the core library, identify any untyped middleware handlers, and propose strict type enhancements.',
    status: 'created',
    currentPhase: 'idle',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metrics: {
      plannedSteps: 4,
      executedSteps: 0,
      filesModified: 0,
      testRuns: 0,
    },
  },
];

tasksRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    data: tasksStore,
    total: tasksStore.length,
    storageEngine: 'in-memory (Phase 1 foundation)',
  });
});

tasksRouter.get('/:id', (req: Request, res: Response) => {
  const task = tasksStore.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json({ data: task });
});

tasksRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateTaskSchema.parse(req.body);

    const newTask: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      repositoryId: validated.repositoryId,
      title: validated.title,
      description: validated.description,
      status: 'created',
      currentPhase: 'idle',
      priority: validated.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        plannedSteps: 0,
        executedSteps: 0,
        filesModified: 0,
        testRuns: 0,
      },
    };

    tasksStore.unshift(newTask);

    res.status(201).json({
      message: 'Task created successfully in Phase 1 registry',
      data: newTask,
    });
  } catch (err) {
    next(err);
  }
});
