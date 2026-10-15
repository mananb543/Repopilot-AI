/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GitFork, CheckCircle, Clock, ArrowRight, ShieldCheck, Cpu, Code2, AlertTriangle } from 'lucide-react';
import { Repository, AgentTask, ServiceHealthStatus } from '@repopilot/shared-types';

interface DashboardViewProps {
  repositories: Repository[];
  tasks: AgentTask[];
  health: ServiceHealthStatus | null;
  healthError: string | null;
  onOpenRepoModal: () => void;
  onOpenTaskModal: () => void;
  onNavigateTab: (tab: 'repositories' | 'tasks' | 'agent-activity' | 'settings') => void;
}

export function DashboardView({
  repositories,
  tasks,
  health,
  healthError,
  onOpenRepoModal,
  onOpenTaskModal,
  onNavigateTab,
}: DashboardViewProps) {
  const recentTasks = tasks.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Product Overview Hero Banner */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span>RepoPilot AI</span>
            <span aria-hidden="true">·</span>
            <span>Architecture Phase 1</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-400">Foundation & Data Contracts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Autonomous software engineering agent and code intelligence platform
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            RepoPilot AI accepts repositories and engineering issues, parses abstract syntax trees, retrieves contextual symbols, formulates structured plans, and executes verified patches in sandboxed containers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenTaskModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-xs"
            >
              Create Engineering Task
            </button>
            <button
              onClick={onOpenRepoModal}
              className="px-4 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700/80 transition-colors"
            >
              Connect Repository
            </button>
            <button
              onClick={() => onNavigateTab('agent-activity')}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1.5"
            >
              <span>View Execution Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Phase 1 Status Banner */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-400">
          <div className="flex items-start gap-2.5">
            <Code2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">Monorepo Structure</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Express API, FastAPI Intelligence, Shared Schemas</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">Data Contracts</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Zod runtime validation for Repos, Tasks & Events</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">Bounded Execution Safety</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Strict limits, sandboxed mode, zero arbitrary execution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Connectivity Status Strip */}
      {healthError && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Backend API Offline:</span> {healthError}. Verify the dev server is running on port 3000.
          </div>
        </div>
      )}

      {/* Metric Cards - Minimalist, No fake charts, Tabular figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Connected Repositories</span>
            <GitFork className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
              {repositories.length}
            </span>
            <span className="text-xs text-neutral-500">active</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Phase 1 metadata registry
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Tasks</span>
            <Clock className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
              {tasks.length}
            </span>
            <span className="text-xs text-neutral-500">registered</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            In-memory state store
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>API Status</span>
            <CheckCircle className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono capitalize text-neutral-100">
              {health?.status || (healthError ? 'error' : 'connecting')}
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {health ? `v${health.version}` : ''}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Uptime: <span className="font-mono tabular-nums">{health?.uptimeSeconds ?? 0}s</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Code Intelligence</span>
            <Cpu className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-neutral-100">
              {health?.components?.codeIntelligence?.status || 'ready'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            FastAPI Tree-sitter core
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Tasks & Connected Repositories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100">
              Recent Engineering Tasks
            </h2>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all ({tasks.length})
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-neutral-400">No tasks created yet.</p>
              <button
                onClick={onOpenTaskModal}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {recentTasks.map((t) => {
                const repo = repositories.find(r => r.id === t.repositoryId);
                return (
                  <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-neutral-200 line-clamp-1">
                        {t.title}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 capitalize shrink-0">
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="font-mono">{repo?.fullName || t.repositoryId}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{t.priority} priority</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Connected Repositories Quick View */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100">
              Connected Repositories
            </h2>
            <button
              onClick={onOpenRepoModal}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Add repo
            </button>
          </div>

          {repositories.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-neutral-400">No repositories connected.</p>
              <button
                onClick={onOpenRepoModal}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Connect a repository
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {repositories.map((r) => (
                <div key={r.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-neutral-200 font-mono">
                      {r.fullName}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 shrink-0">
                      connected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="capitalize">{r.provider}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">branch: {r.defaultBranch}</span>
                    {r.metadata?.language && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{r.metadata.language}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
