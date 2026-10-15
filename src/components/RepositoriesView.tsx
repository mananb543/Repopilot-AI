/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GitFork, ExternalLink, Plus, AlertCircle, CheckCircle2, GitBranch, RefreshCw } from 'lucide-react';
import { Repository, CreateRepositorySchema } from '@repopilot/shared-types';
import { ApiClient } from '../services/apiClient.ts';

interface RepositoriesViewProps {
  repositories: Repository[];
  onRepositoryAdded: (repo: Repository) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function RepositoriesView({
  repositories,
  onRepositoryAdded,
  onRefresh,
  loading,
}: RepositoriesViewProps) {
  const [urlInput, setUrlInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validation = CreateRepositorySchema.safeParse({
      url: urlInput.trim(),
      defaultBranch: branchInput.trim() || 'main',
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid Git URL');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiClient.createRepository({
        url: urlInput.trim(),
        defaultBranch: branchInput.trim() || 'main',
      });
      setSuccessMsg(`Connected repository: ${res.data.fullName}`);
      onRepositoryAdded(res.data);
      setUrlInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register repository');
    } finally {
      setSubmitting(false);
    }
  };

  const sampleRepos = [
    'https://github.com/fastapi/fastapi',
    'https://github.com/expressjs/express',
    'https://github.com/astral-sh/uv',
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Repositories</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage target source code repositories for autonomous analysis, indexing, and pull request generation.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connect Repository Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-200">
            Connect a New Repository
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Phase 1 registers repository contracts. Remote cloning and AST indexing pipeline will activate in Phase 2.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Repository URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                Default Branch
              </label>
              <input
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span>Quick presets:</span>
            {sampleRepos.map((sample) => (
              <button
                type="button"
                key={sample}
                onClick={() => {
                  setUrlInput(sample);
                  setError(null);
                }}
                className="font-mono text-[11px] text-neutral-300 hover:text-indigo-400 underline decoration-neutral-700 underline-offset-2 transition-colors"
              >
                {sample.replace('https://github.com/', '')}
              </button>
            ))}
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !urlInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-xs transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Registering...' : 'Connect Repository'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Repositories Table / Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-200">
          Registered Repositories ({repositories.length})
        </h2>

        {repositories.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-12 text-center space-y-3">
            <GitFork className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-300">No repositories registered</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add a GitHub, GitLab, or Bitbucket repository URL above to begin indexing symbols and scheduling tasks.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
            <div className="divide-y divide-neutral-800/80">
              {repositories.map((repo) => (
                <div key={repo.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-100 font-mono">
                        {repo.fullName}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        {repo.connectionStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span className="capitalize">{repo.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">default: {repo.defaultBranch}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Added {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {repo.metadata?.description && (
                      <p className="text-xs text-neutral-500 pt-0.5 line-clamp-1">
                        {repo.metadata.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      <span>View remote</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
