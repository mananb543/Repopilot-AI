/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RefreshCw, Terminal } from 'lucide-react';
import { ServiceHealthStatus } from '@repopilot/shared-types';

export type NavTab = 'dashboard' | 'repositories' | 'tasks' | 'agent-activity' | 'settings';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  health: ServiceHealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;
  healthLatency: number;
  onRefreshHealth: () => void;
  onOpenTaskModal: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  health,
  healthLoading,
  healthError,
  healthLatency,
  onRefreshHealth,
  onOpenTaskModal,
}: HeaderProps) {
  const isHealthy = health?.status === 'ok';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 text-left focus-visible:outline-hidden"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-100 whitespace-nowrap">
              RepoPilot AI
            </span>
          </button>
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline whitespace-nowrap">
            Phase 1
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {(
            [
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'repositories', label: 'Repositories' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'agent-activity', label: 'Agent Activity' },
              { id: 'settings', label: 'Settings' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white bg-neutral-900 border border-neutral-700/80 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Health Indicator & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live API Health indicator */}
          <div 
            onClick={onRefreshHealth}
            title={healthError ? `API unreachable: ${healthError}` : `API Status: ${health?.status || 'checking'} (${healthLatency}ms)`}
            className="hidden lg:flex items-center gap-1.5 cursor-pointer text-xs text-neutral-400 hover:text-neutral-200 py-1 px-2 rounded-md hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
          >
            {healthLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-neutral-500" />
            ) : isHealthy ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            )}
            <span className="font-mono text-[11px] tabular-nums">
              {healthLoading ? 'checking' : isHealthy ? `API ${healthLatency}ms` : 'API offline'}
            </span>
          </div>

          <button
            onClick={onOpenTaskModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            + New Task
          </button>
        </div>
      </div>
    </header>
  );
}
