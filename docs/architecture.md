# RepoPilot AI — Architecture Specification

## 1. Executive Summary

RepoPilot AI is an autonomous software engineering agent designed to ingest GitHub/GitLab repositories, retrieve contextual code symbols, synthesize multi-step modification plans, execute bounded code edits, run localized test suites in isolated sandboxes, and submit verified Git diffs.

Phase 1 establishes the monorepo architecture, shared type system, runtime validation boundaries, Express and FastAPI health checks, and a responsive developer console.

---

## 2. Monorepo Structure & Boundaries

```
repopilot/
  apps/
    web/                  # React 19 SPA dashboard
  services/
    api/                  # Express API service (Node.js/TypeScript)
    agent-worker/         # Bounded agent orchestration worker
    code-intelligence/    # FastAPI service for AST parsing & Tree-sitter
  packages/
    shared-types/         # Shared TypeScript contracts and Zod schemas
    config/               # Reusable configuration & runtime environment validation
  infrastructure/
    docker/               # Container definitions & docker-compose topology
  docs/                   # Architecture, roadmap, security, decisions
  scripts/                # Development, verification, and health check scripts
  .env.example            # Canonical environment variable specification
  .gitignore              # Comprehensive exclusion rules
  README.md               # Quickstart and development guide
```

### Module Responsibilities

| Service / Package | Runtime | Responsibilities | Boundaries |
| :--- | :--- | :--- | :--- |
| `apps/web` | React 19 / Vite | Developer dashboard, repository registration, task creation, execution timeline, diagnostics. | Communicates exclusively with `services/api`. No direct database or LLM access. |
| `services/api` | Node.js / Express | Request validation via Zod, repository metadata registry, task state persistence, health telemetry. | Authoritative gateway for client requests. |
| `services/code-intelligence` | Python 3.10+ / FastAPI | Abstract Syntax Tree (AST) parsing via Tree-sitter, symbol table extraction, future semantic vector search. | Stateless, computationally intensive AST and embedding workloads. |
| `services/agent-worker` | Node.js / TypeScript | Finite state machine orchestrator, bounded iteration loops, execution budget enforcement. | Executes tasks within strict quotas (max 20 iterations, 10 min timeout, max 3 repair attempts). |
| `packages/shared-types` | TypeScript / Zod | Canonical data models for Repositories, Tasks, Events, and Health checks. | Shared across frontend, API, and worker services. |
| `packages/config` | TypeScript / Zod | Runtime environment variable validation and application metadata. | Zero side-effects; pure validation and config loading. |

---

## 3. Data Flow Architecture

```
[ User Browser / Web Dashboard ]
              │
              ▼  (HTTP REST / Future WebSocket)
    [ Express API Gateway ]
       (services/api)
       ┌──────┴─────────────────────────────────┐
       ▼                                        ▼
[ Code Intelligence ]                    [ Agent Worker ]
(FastAPI / Tree-sitter)               (State Orchestrator)
       │                                        │
       ▼ (Phase 2)                              ▼ (Phase 4)
[ PostgreSQL + pgvector ]             [ Ephemeral Docker Sandbox ]
```

### 1. Ingestion Phase
- User registers a repository URL (`https://github.com/owner/repo`).
- URL is validated using regex patterns in `packages/shared-types` / Zod.
- In Phase 2, `services/code-intelligence` clones the repository into an isolated volume and builds the symbol index.

### 2. Task Scheduling Phase
- User submits a task description with selected repository and priority.
- Payload is validated via `CreateTaskSchema`.
- Task state initiates at `created` with `idle` phase.

### 3. Execution Pipeline (Planned Phase 3 & 4)
- Worker transitions task from `created` -> `planning` -> `retrieving` -> `executing` -> `verifying`.
- Bounded tool calling limits maximum file alterations to 15 files and 20 iterations.
- Tests execute in ephemeral non-root containers.

---

## 4. Diagnostics & Health Architecture

- `services/api` exposes `GET /api/health` returning JSON with process uptime, service version, environment, and downstream dependency statuses (PostgreSQL and Code Intelligence).
- `services/code-intelligence` exposes `GET /health` returning Python version, uptime, and Tree-sitter supported grammars.
- `apps/web` polls `/api/health` with latency metrics, rendering real connectivity states without artificial optimism.
