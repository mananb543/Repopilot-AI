/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  GitCommit, 
  Terminal, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  FileCode, 
  Layers
} from 'lucide-react';
import { AgentEvent } from '@repopilot/shared-types';

export function AgentActivityView() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  // Sample structured event stream matching AgentEvent contract from shared-types
  const sampleEvents: AgentEvent[] = [
    {
      id: 'evt-001',
      taskId: 'task-sample-1',
      eventType: 'phase_change',
      timestamp: '2026-10-14T12:00:01Z',
      sequenceNumber: 1,
      payload: {
        phase: 'repo_indexing',
        message: 'Cloned repository into isolated staging volume /tmp/repopilot/workspaces/repo-sample-1',
      },
    },
    {
      id: 'evt-002',
      taskId: 'task-sample-1',
      eventType: 'tool_call',
      timestamp: '2026-10-14T12:00:04Z',
      sequenceNumber: 2,
      payload: {
        toolName: 'ast_extract_symbols',
        toolArgs: { language: 'typescript', files: 42 },
        message: 'Extracted 184 symbols (functions, classes, interfaces) via tree-sitter parser',
      },
    },
    {
      id: 'evt-003',
      taskId: 'task-sample-1',
      eventType: 'thought',
      timestamp: '2026-10-14T12:00:08Z',
      sequenceNumber: 3,
      payload: {
        message: 'Identified candidate entry point in router/index.ts: missing type guard on session token payload.',
      },
    },
    {
      id: 'evt-004',
      taskId: 'task-sample-1',
      eventType: 'file_diff',
      timestamp: '2026-10-14T12:00:15Z',
      sequenceNumber: 4,
      payload: {
        filePath: 'src/router/authMiddleware.ts',
        diffContent: `@@ -14,3 +14,5 @@\n export function verifyAuth(req: Request) {\n-  return req.headers['authorization'];\n+  const header = req.headers['authorization'];\n+  if (!header || !header.startsWith('Bearer ')) return null;\n+  return header.slice(7);\n }`,
      },
    },
    {
      id: 'evt-005',
      taskId: 'task-sample-1',
      eventType: 'test_run',
      timestamp: '2026-10-14T12:00:22Z',
      sequenceNumber: 5,
      payload: {
        testSuite: 'npm test -- authMiddleware.test.ts',
        testPassed: true,
        message: 'All 6 unit tests passed in isolated container sandbox.',
      },
    },
  ];

  const pipelineStages = [
    {
      number: 1,
      title: 'Repository Indexing',
      service: 'services/code-intelligence',
      status: 'Active Foundation',
      desc: 'Clones repository into ephemeral volume and builds AST symbol tables with Tree-sitter.',
    },
    {
      number: 2,
      title: 'Hybrid Code Retrieval',
      service: 'packages/shared-types & pgvector',
      status: 'Planned Phase 2',
      desc: 'Retrieves relevant functions, imports, and documentation using BM25 keyword matching and dense embeddings.',
    },
    {
      number: 3,
      title: 'Structured Reasoning & Tool Calling',
      service: 'services/agent-worker',
      status: 'Planned Phase 3',
      desc: 'Autonomous LLM planner issues bounded edits (file read, file patch, lint) within strict iteration budgets.',
    },
    {
      number: 4,
      title: 'Isolated Test & Lint Execution',
      service: 'infrastructure/docker',
      status: 'Planned Phase 4',
      desc: 'Executes project test suites inside hermetic Docker containers with zero network access.',
    },
    {
      number: 5,
      title: 'Verification & Diff Generation',
      service: 'services/api & git',
      status: 'Planned Phase 5',
      desc: 'Generates clean Git diff, verifies branch sanity, and prepares structured pull request report.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold text-neutral-100">Agent Activity & Execution Pipeline</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Lifecycle timeline and streaming event telemetry for autonomous coding sessions.
        </p>
      </div>

      {/* Honest Implementation Notice */}
      <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs text-amber-300">
          <p className="font-semibold text-neutral-200">
            Phase 1 Architecture Preview (Unconnected Pipeline)
          </p>
          <p className="text-amber-300/90 leading-relaxed">
            The autonomous execution pipeline is currently at the architectural foundation stage. The event stream and execution phases displayed below represent the target data contracts and state machine defined in <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-200">packages/shared-types</code> and <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-200">services/agent-worker</code>. Real-time WebSocket streaming and LLM reasoning will be connected in Phase 3.
          </p>
        </div>
      </div>

      {/* Pipeline Stages Diagram */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-200">
          Staged Execution Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const isSelected = selectedPhase === stage.number;
            return (
              <button
                key={stage.number}
                type="button"
                onClick={() => setSelectedPhase(stage.number)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-neutral-900 shadow-sm ring-1 ring-indigo-500/50'
                    : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mb-2">
                  <span>0{stage.number}.</span>
                  <span className={`text-[10px] ${stage.status.includes('Active') ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {stage.status.includes('Active') ? 'Foundation' : 'Planned'}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-neutral-200 mb-1">
                  {stage.title}
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {stage.service}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-xs text-neutral-400">
          <span className="font-semibold text-neutral-200">Stage 0{selectedPhase} Details: </span>
          {pipelineStages[selectedPhase - 1].desc}
        </div>
      </div>

      {/* Execution Boundaries & Safety Box */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Execution Boundaries & Safety Guarantees</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block">Max Agent Iterations</span>
            <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">20</span>
            <span className="text-[11px] text-neutral-500 block">Hard bound per task</span>
          </div>

          <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block">Max Execution Timeout</span>
            <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">600s</span>
            <span className="text-[11px] text-neutral-500 block">10 min ceiling</span>
          </div>

          <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block">Max Files Modified</span>
            <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">15 files</span>
            <span className="text-[11px] text-neutral-500 block">Blast radius cap</span>
          </div>

          <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block">Repair Loop Attempts</span>
            <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">3 max</span>
            <span className="text-[11px] text-neutral-500 block">Bounded test self-repair</span>
          </div>
        </div>
      </div>

      {/* Target Event Timeline Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Agent Event Stream Contract Preview</span>
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            AgentEvent Schema v0.1.0
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden divide-y divide-neutral-800/80">
          {sampleEvents.map((evt) => {
            const getIcon = () => {
              switch (evt.eventType) {
                case 'phase_change': return <Play className="w-3.5 h-3.5 text-indigo-400" />;
                case 'tool_call': return <Terminal className="w-3.5 h-3.5 text-violet-400" />;
                case 'thought': return <Layers className="w-3.5 h-3.5 text-neutral-400" />;
                case 'file_diff': return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
                case 'test_run': return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
                default: return <GitCommit className="w-3.5 h-3.5 text-neutral-400" />;
              }
            };

            return (
              <div key={evt.id} className="p-4 sm:p-5 hover:bg-neutral-900/40 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-neutral-800/80 border border-neutral-700/60">
                      {getIcon()}
                    </span>
                    <span className="font-mono font-medium text-neutral-200">
                      {evt.eventType}
                    </span>
                    {evt.payload.toolName && (
                      <span className="font-mono text-indigo-400 text-[11px]">
                        ({evt.payload.toolName})
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-neutral-500 tabular-nums">
                    {evt.timestamp}
                  </span>
                </div>

                {evt.payload.message && (
                  <p className="text-xs text-neutral-300 pl-7 leading-relaxed">
                    {evt.payload.message}
                  </p>
                )}

                {evt.payload.diffContent && (
                  <div className="pl-7 mt-2">
                    <pre className="font-mono text-[11px] bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-neutral-300 overflow-x-auto">
                      {evt.payload.diffContent}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
