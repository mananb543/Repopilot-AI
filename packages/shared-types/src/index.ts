/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// ==========================================
// Repository Contracts
// ==========================================

export type RepositoryProvider = 'github' | 'gitlab' | 'bitbucket' | 'local';

export type RepositoryConnectionStatus = 
  | 'unconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error';

export interface Repository {
  id: string;
  provider: RepositoryProvider;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  connectionStatus: RepositoryConnectionStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    isPrivate?: boolean;
    language?: string;
    description?: string;
  };
}

export const CreateRepositorySchema = z.object({
  url: z.string().url('Must be a valid repository URL').refine((val) => {
    return /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(val) ||
           /^git@[\w.-]+:[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(val);
  }, {
    message: 'URL must be a valid GitHub, GitLab, or Bitbucket repository URL (e.g., https://github.com/owner/repo)',
  }),
  defaultBranch: z.string().default('main'),
});

export type CreateRepositoryInput = z.infer<typeof CreateRepositorySchema>;

// ==========================================
// Agent Task Contracts
// ==========================================

export type TaskStatus = 
  | 'created'
  | 'queued'
  | 'planning'
  | 'retrieving'
  | 'executing'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskPhase = 
  | 'idle'
  | 'repo_indexing'
  | 'context_retrieval'
  | 'plan_generation'
  | 'code_modification'
  | 'test_execution'
  | 'diff_review'
  | 'finished';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface AgentTask {
  id: string;
  repositoryId: string;
  title: string;
  description: string;
  status: TaskStatus;
  currentPhase: TaskPhase;
  priority: TaskPriority;
  branchName?: string;
  errorSummary?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metrics?: {
    plannedSteps?: number;
    executedSteps?: number;
    filesModified?: number;
    testRuns?: number;
    tokensUsed?: number;
  };
}

export const CreateTaskSchema = z.object({
  repositoryId: z.string().min(1, 'Repository selection is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().min(10, 'Task description must be at least 10 characters').max(4000, 'Description cannot exceed 4000 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// ==========================================
// Agent Event Contracts (Future Streaming & Log Timeline)
// ==========================================

export type AgentEventType = 
  | 'phase_change'
  | 'thought'
  | 'tool_call'
  | 'tool_result'
  | 'file_diff'
  | 'test_run'
  | 'error'
  | 'completion';

export interface AgentEventPayload {
  phase?: TaskPhase;
  message?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
  filePath?: string;
  diffContent?: string;
  testSuite?: string;
  testPassed?: boolean;
  errorCode?: string;
  details?: Record<string, unknown>;
}

export interface AgentEvent {
  id: string;
  taskId: string;
  eventType: AgentEventType;
  timestamp: string;
  sequenceNumber: number;
  payload: AgentEventPayload;
}

// ==========================================
// Health & Diagnostics Contracts
// ==========================================

export interface ServiceHealthStatus {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  uptimeSeconds: number;
  components?: {
    database?: {
      status: 'connected' | 'unconnected' | 'unconfigured';
      message?: string;
    };
    codeIntelligence?: {
      status: 'online' | 'offline' | 'unreachable';
      endpoint?: string;
      latencyMs?: number;
    };
    agentWorker?: {
      status: 'idle' | 'busy' | 'unconnected';
    };
  };
}
