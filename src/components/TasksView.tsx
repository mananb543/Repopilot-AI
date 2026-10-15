/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Plus, RefreshCw, Layers, Eye, Info } from 'lucide-react';
import { AgentTask, Repository, TaskStatus } from '@repopilot/shared-types';

interface TasksViewProps {
  tasks: AgentTask[];
  repositories: Repository[];
  onOpenTaskModal: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function TasksView({
  tasks,
  repositories,
  onOpenTaskModal,
  onRefresh,
  loading,
}: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [filter, setFilter] = useState<'all' | 'created' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'created') return t.status === 'created' || t.status === 'queued';
    if (filter === 'active') return ['planning', 'retrieving', 'executing', 'verifying'].includes(t.status);
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'failed': return 'text-rose-400';
      case 'executing':
      case 'planning':
      case 'verifying': return 'text-indigo-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Engineering Tasks</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Autonomous agent task queue. Phase 1 registers validated task contracts and state transitions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Honest Storage Engine Info Callout */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-neutral-200">Phase 1 Task Contract Foundation</p>
          <p className="leading-relaxed">
            Tasks created here are validated at runtime via Zod schemas and persisted in the Express API store. PostgreSQL with pgvector will be introduced in Phase 2 for durable persistence and semantic retrieval.
          </p>
        </div>
      </div>

      {/* Filter Tabs - Interactive segmented control as per frontend-design */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900/60 border border-neutral-800/80 rounded-lg w-fit">
        {(
          [
            { id: 'all', label: `All (${tasks.length})` },
            { id: 'created', label: 'Queued' },
            { id: 'active', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === tab.id
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Table / Cards */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-12 text-center space-y-3">
          <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-300">No tasks in this view</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {filter === 'all' 
              ? 'No engineering tasks have been submitted yet. Create a task to test the schema validation.'
              : `No tasks found matching filter "${filter}".`}
          </p>
          <button
            onClick={onOpenTaskModal}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden divide-y divide-neutral-800/80">
          {filteredTasks.map((task) => {
            const repo = repositories.find((r) => r.id === task.repositoryId);
            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 hover:bg-neutral-900/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-100 truncate">
                      {task.title}
                    </span>
                    <span className={`text-xs font-mono capitalize ${getStatusColor(task.status)} shrink-0`}>
                      {task.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1">
                    <span className="font-mono text-neutral-300">{repo?.fullName || task.repositoryId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{task.priority} priority</span>
                    <span aria-hidden="true">·</span>
                    <span>phase: <span className="font-mono text-neutral-300">{task.currentPhase}</span></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(task.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal / Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                  <span>ID: {selectedTask.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`capitalize font-semibold ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-neutral-100">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-neutral-300 mb-1">Description</h3>
                <p className="text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block text-[11px]">Phase</span>
                  <span className="text-neutral-200">{selectedTask.currentPhase}</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block text-[11px]">Priority</span>
                  <span className="text-neutral-200 capitalize">{selectedTask.priority}</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block text-[11px]">Planned Steps</span>
                  <span className="text-neutral-200 tabular-nums">{selectedTask.metrics?.plannedSteps ?? 0}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-300 mb-1">Raw Contract Representation (JSON)</h3>
                <pre className="font-mono text-[11px] bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-neutral-300 overflow-x-auto">
                  {JSON.stringify(selectedTask, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
