/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Repository, 
  AgentTask, 
  ServiceHealthStatus, 
  CreateRepositoryInput, 
  CreateTaskInput 
} from '@repopilot/shared-types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ConfigStatusResponse {
  environment: string;
  providers: {
    gemini: { configured: boolean; model: string };
    anthropic: { configured: boolean; model: string };
    openai: { configured: boolean; model: string };
  };
  integrations: {
    codeIntelligenceService: { endpoint: string; active: boolean };
    postgresPgvector: { configured: boolean; active: boolean; note: string };
    redisQueue: { configured: boolean; active: boolean; note: string };
    dockerExecutionSandbox: { available: boolean; note: string };
  };
  security: {
    arbitraryShellExecution: string;
    sandboxedMode: string;
    phase: number;
  };
}

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Request timed out while connecting to API server');
      }
      throw err;
    }
  }

  static async getHealth(): Promise<{ data: ServiceHealthStatus; latencyMs: number }> {
    const start = performance.now();
    const data = await this.request<ServiceHealthStatus>('/api/health');
    const latencyMs = Math.round(performance.now() - start);
    return { data, latencyMs };
  }

  static async getRepositories(): Promise<{ data: Repository[]; total: number }> {
    return this.request<{ data: Repository[]; total: number }>('/api/repositories');
  }

  static async createRepository(input: CreateRepositoryInput): Promise<{ message: string; data: Repository }> {
    return this.request<{ message: string; data: Repository }>('/api/repositories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  static async getTasks(): Promise<{ data: AgentTask[]; total: number }> {
    return this.request<{ data: AgentTask[]; total: number }>('/api/tasks');
  }

  static async createTask(input: CreateTaskInput): Promise<{ message: string; data: AgentTask }> {
    return this.request<{ message: string; data: AgentTask }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  static async getConfigStatus(): Promise<ConfigStatusResponse> {
    return this.request<ConfigStatusResponse>('/api/config-status');
  }
}
