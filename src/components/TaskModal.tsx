/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, GitFork } from 'lucide-react';
import { ApiClient } from '../services/apiClient.ts';
import { Repository, AgentTask, CreateTaskSchema, TaskPriority } from '@repopilot/shared-types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onTaskCreated: (task: AgentTask) => void;
}

export function TaskModal({ isOpen, onClose, repositories, onTaskCreated }: TaskModalProps) {
  const [repositoryId, setRepositoryId] = useState(repositories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!repositoryId) {
      setError('Please select a repository');
      return;
    }

    const validation = CreateTaskSchema.safeParse({
      repositoryId,
      title: title.trim(),
      description: description.trim(),
      priority,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid task input');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.createTask({
        repositoryId,
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      setSuccessMsg(`Task queued: ${res.data.title}`);
      onTaskCreated(res.data);
      setTimeout(() => {
        onClose();
        setTitle('');
        setDescription('');
        setSuccessMsg(null);
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div 
        className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-task-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 id="modal-task-title" className="text-base font-semibold text-neutral-100">
              Create Engineering Task
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Specify a bugfix, refactor, or feature task for the autonomous coding agent.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-neutral-400" />
              Target Repository <span className="text-rose-400">*</span>
            </label>
            {repositories.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400">
                No repositories registered yet. Please connect a repository first.
              </div>
            ) : (
              <select
                value={repositoryId}
                onChange={(e) => setRepositoryId(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.fullName} ({repo.defaultBranch})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Fix token expiry in OAuth callback handler"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Task Description & Context <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the issue, expected outcome, relevant files, or reproduction steps..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Priority Level
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium border capitalize transition-colors ${
                    priority === p
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || repositories.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
