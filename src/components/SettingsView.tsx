/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Layers
} from 'lucide-react';
import { ServiceHealthStatus } from '@repopilot/shared-types';
import { ApiClient, ConfigStatusResponse } from '../services/apiClient.ts';

interface SettingsViewProps {
  health: ServiceHealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;
  healthLatency: number;
  onRefreshHealth: () => void;
}

export function SettingsView({
  health,
  healthLoading,
  healthError,
  healthLatency,
  onRefreshHealth,
}: SettingsViewProps) {
  const [configStatus, setConfigStatus] = useState<ConfigStatusResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setConfigLoading(true);
    setConfigError(null);
    try {
      const data = await ApiClient.getConfigStatus();
      setConfigStatus(data);
    } catch (err: unknown) {
      setConfigError(err instanceof Error ? err.message : 'Failed to load configuration status');
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const monorepoModules = [
    { name: 'apps/web', desc: 'React 19 SPA, Tailwind CSS, Vite frontend dashboard', type: 'Frontend App' },
    { name: 'services/api', desc: 'Node.js Express API, Zod validation, health checks, route handlers', type: 'Backend Service' },
    { name: 'services/code-intelligence', desc: 'FastAPI service, Tree-sitter AST extraction & symbol discovery', type: 'Python Service' },
    { name: 'services/agent-worker', desc: 'Bounded execution limits, state transitions, autonomous task worker stub', type: 'Worker Service' },
    { name: 'packages/shared-types', desc: 'Shared TypeScript data contracts, enums, and Zod schemas', type: 'Shared Library' },
    { name: 'packages/config', desc: 'Reusable environment validation and configuration constants', type: 'Shared Library' },
    { name: 'infrastructure/docker', desc: 'Docker Compose and multi-stage Dockerfiles for hermetic execution', type: 'Infrastructure' },
    { name: 'docs', desc: 'Architecture, implementation roadmap, security, decisions, and API contracts', type: 'Documentation' },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Settings & System Diagnostics</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time backend service connectivity, LLM provider integration status, and security invariants.
          </p>
        </div>
        <button
          onClick={() => {
            onRefreshHealth();
            fetchConfig();
          }}
          disabled={healthLoading || configLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${healthLoading || configLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Backend Connectivity Status Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-200">
              Backend Service Connectivity
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Real Health Check Probe
          </span>
        </div>

        {healthError ? (
          <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-4 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Express API Unreachable: {healthError}</span>
            </div>
            <p className="text-rose-400/80">
              Ensure the dev server is active and the Express middleware is mounted on port 3000.
            </p>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Express API Status</span>
              <span className="font-mono text-emerald-400 font-semibold uppercase">{health.status}</span>
              <span className="text-neutral-500 block text-[11px] font-mono tabular-nums">
                Latency: {healthLatency}ms
              </span>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Service Version</span>
              <span className="font-mono text-neutral-200">{health.version}</span>
              <span className="text-neutral-500 block text-[11px]">Env: {health.environment}</span>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Process Uptime</span>
              <span className="font-mono text-neutral-200 tabular-nums">{health.uptimeSeconds} seconds</span>
              <span className="text-neutral-500 block text-[11px]">Node.js v22 runtime</span>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Code Intelligence</span>
              <span className="font-mono text-neutral-200 capitalize">
                {health.components?.codeIntelligence?.status || 'ready'}
              </span>
              <span className="text-neutral-500 block text-[11px] font-mono truncate">
                {health.components?.codeIntelligence?.endpoint || 'FastAPI port 8000'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-400 py-4 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Probing backend service...</span>
          </div>
        )}
      </div>

      {/* Model Provider Configuration Status */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-200">
              Model Provider Configuration
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Keys injected server-side only
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          RepoPilot AI utilizes provider-agnostic LLM integration. Model API credentials are kept strictly in server-side environment variables and are never surfaced to the browser.
        </p>

        {configError && (
          <p className="text-xs text-rose-400">{configError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Google Gemini</span>
              {configStatus?.providers?.gemini?.configured ? (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Configured
                </span>
              ) : (
                <span className="text-neutral-500 font-mono text-[11px]">Not configured</span>
              )}
            </div>
            <p className="text-neutral-500 text-[11px]">
              Primary model: <span className="font-mono text-neutral-400">gemini-2.5-pro</span>
            </p>
            <p className="text-neutral-500 text-[11px]">
              Set via <code className="font-mono text-neutral-400">GEMINI_API_KEY</code>
            </p>
          </div>

          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Anthropic Claude</span>
              {configStatus?.providers?.anthropic?.configured ? (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Configured
                </span>
              ) : (
                <span className="text-neutral-500 font-mono text-[11px]">Not configured</span>
              )}
            </div>
            <p className="text-neutral-500 text-[11px]">
              Primary model: <span className="font-mono text-neutral-400">claude-3-7-sonnet</span>
            </p>
            <p className="text-neutral-500 text-[11px]">
              Set via <code className="font-mono text-neutral-400">ANTHROPIC_API_KEY</code>
            </p>
          </div>

          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">OpenAI</span>
              {configStatus?.providers?.openai?.configured ? (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Configured
                </span>
              ) : (
                <span className="text-neutral-500 font-mono text-[11px]">Not configured</span>
              )}
            </div>
            <p className="text-neutral-500 text-[11px]">
              Primary model: <span className="font-mono text-neutral-400">gpt-4o</span>
            </p>
            <p className="text-neutral-500 text-[11px]">
              Set via <code className="font-mono text-neutral-400">OPENAI_API_KEY</code>
            </p>
          </div>
        </div>
      </div>

      {/* Security Policies & Safe Execution Guidance */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-neutral-200">
            Security Invariants & Boundary Enforcements
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400 leading-relaxed">
          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-1.5">
            <p className="font-semibold text-neutral-200">Zero Arbitrary Shell Execution</p>
            <p>
              In accordance with Phase 1 standards, the API does NOT expose any endpoint capable of invoking arbitrary shell commands. Tool calls are strictly typed, bounded, and audited.
            </p>
          </div>

          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-1.5">
            <p className="font-semibold text-neutral-200">Isolated Container Sandboxing (Phase 4)</p>
            <p>
              Code execution and test suites run in hermetic Docker containers with read-only root filesystems, dropped capabilities, memory caps, and zero host network access.
            </p>
          </div>
        </div>
      </div>

      {/* Monorepo Architecture Directory Map */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-200">
              Monorepo Architecture Structure
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Phase 1 Scaffold
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 divide-y divide-neutral-800/80 overflow-hidden">
          {monorepoModules.map((mod) => (
            <div key={mod.name} className="p-3 sm:px-4 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="font-mono font-semibold text-neutral-200">{mod.name}</span>
                <p className="text-neutral-500 text-[11px]">{mod.desc}</p>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 shrink-0">
                {mod.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
