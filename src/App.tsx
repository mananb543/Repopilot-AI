/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RepositoriesView } from './components/RepositoriesView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { AgentActivityView } from './components/AgentActivityView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { RepoModal } from './components/RepoModal.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { ApiClient } from './services/apiClient.ts';
import { Repository, AgentTask, ServiceHealthStatus } from '@repopilot/shared-types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Repositories state
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [reposLoading, setReposLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Health check state
  const [health, setHealth] = useState<ServiceHealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLatency, setHealthLatency] = useState(0);

  // Modals state
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Fetch Health
  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await ApiClient.getHealth();
      setHealth(res.data);
      setHealthLatency(res.latencyMs);
    } catch (err: unknown) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : 'Failed to reach API');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Fetch Repositories
  const fetchRepositories = useCallback(async () => {
    setReposLoading(true);
    try {
      const res = await ApiClient.getRepositories();
      setRepositories(res.data);
    } catch (err) {
      console.error('Failed to load repositories:', err);
    } finally {
      setReposLoading(false);
    }
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await ApiClient.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchRepositories();
    fetchTasks();

    // Periodic health polling every 30s
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchRepositories, fetchTasks]);

  const handleRepositoryAdded = (newRepo: Repository) => {
    setRepositories(prev => [newRepo, ...prev]);
  };

  const handleTaskCreated = (newTask: AgentTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        healthLoading={healthLoading}
        healthError={healthError}
        healthLatency={healthLatency}
        onRefreshHealth={checkHealth}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            repositories={repositories}
            tasks={tasks}
            health={health}
            healthError={healthError}
            onOpenRepoModal={() => setIsRepoModalOpen(true)}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'repositories' && (
          <RepositoriesView
            repositories={repositories}
            onRepositoryAdded={handleRepositoryAdded}
            onRefresh={fetchRepositories}
            loading={reposLoading}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            repositories={repositories}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
            onRefresh={fetchTasks}
            loading={tasksLoading}
          />
        )}

        {activeTab === 'agent-activity' && (
          <AgentActivityView />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            health={health}
            healthLoading={healthLoading}
            healthError={healthError}
            healthLatency={healthLatency}
            onRefreshHealth={checkHealth}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">RepoPilot AI</span>
            <span aria-hidden="true">·</span>
            <span>Phase 1 Architecture Foundation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>FastAPI Code Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Express API Engine</span>
            <span aria-hidden="true">·</span>
            <span>React 19 SPA</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RepoModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        onRepositoryAdded={handleRepositoryAdded}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        repositories={repositories}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
