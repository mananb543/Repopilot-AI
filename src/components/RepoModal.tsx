/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../services/apiClient.ts';
import { Repository, CreateRepositorySchema } from '@repopilot/shared-types';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositoryAdded: (repo: Repository) => void;
}

export function RepoModal({ isOpen, onClose, onRepositoryAdded }: RepoModalProps) {
  const [url, setUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validation = CreateRepositorySchema.safeParse({ url: url.trim(), defaultBranch: defaultBranch.trim() });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid repository format');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.createRepository({
        url: url.trim(),
        defaultBranch: defaultBranch.trim() || 'main',
      });
      setSuccessMsg(`Repository registered: ${res.data.fullName}`);
      onRepositoryAdded(res.data);
      setTimeout(() => {
        onClose();
        setUrl('');
        setSuccessMsg(null);
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div 
        className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-repo-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 id="modal-repo-title" className="text-base font-semibold text-neutral-100">
              Connect Repository
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Register a remote Git repository for AST indexing and agent analysis.
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
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Repository URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Supported providers: GitHub, GitLab, and Bitbucket.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
              Default Branch
            </label>
            <input
              type="text"
              placeholder="main"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
            />
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
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registering...' : 'Register Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
