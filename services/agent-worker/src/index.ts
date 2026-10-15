/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentTask, TaskStatus, TaskPhase, AgentEvent } from '@repopilot/shared-types';

export interface AgentExecutionLimits {
  maxIterations: number;
  maxExecutionTimeSeconds: number;
  maxFilesModified: number;
  maxRepairAttempts: number;
  allowShellExecution: boolean;
}

export const DEFAULT_EXECUTION_LIMITS: AgentExecutionLimits = {
  maxIterations: 20,
  maxExecutionTimeSeconds: 600, // 10 minutes max
  maxFilesModified: 15,
  maxRepairAttempts: 3,
  allowShellExecution: false, // strictly sandboxed in Phase 1
};

export interface AgentContext {
  task: AgentTask;
  limits: AgentExecutionLimits;
  events: AgentEvent[];
  workspaceDir?: string;
  activeBranch?: string;
}

/**
 * Task state machine transitions permitted in RepoPilot execution lifecycle.
 */
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  created: ['queued', 'planning', 'cancelled'],
  queued: ['planning', 'cancelled'],
  planning: ['retrieving', 'failed', 'cancelled'],
  retrieving: ['executing', 'failed', 'cancelled'],
  executing: ['verifying', 'failed', 'cancelled'],
  verifying: ['completed', 'executing', 'failed'], // executing if self-repair loop triggered
  completed: [],
  failed: ['created'], // retry
  cancelled: [],
};

export function canTransition(current: TaskStatus, next: TaskStatus): boolean {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Bounded Agent Worker (stubbed for Phase 1 architecture foundation).
 * Full autonomous reasoning loop will be wired in Phase 3.
 */
export class AgentWorkerStub {
  private readonly limits: AgentExecutionLimits;

  constructor(limits: Partial<AgentExecutionLimits> = {}) {
    this.limits = { ...DEFAULT_EXECUTION_LIMITS, ...limits };
  }

  getLimits(): AgentExecutionLimits {
    return this.limits;
  }

  isPhaseSupported(phase: TaskPhase): boolean {
    return phase !== 'finished';
  }
}
