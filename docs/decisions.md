# RepoPilot AI — Architectural Decision Records (ADRs)

This document records the architectural decisions, trade-offs, and design rationales made during the development of RepoPilot AI.

---

## ADR 001: Monorepo Topology & Separation of Concerns

### Context:
RepoPilot AI requires a rich web interface (React), an API gateway with request validation and task state management (Node.js/Express), an AST parsing service for code intelligence (Python/FastAPI with Tree-sitter), and background orchestration workers.

### Decision:
Adopt an npm workspaces monorepo structure with clear folder boundaries:
- `apps/web`: React 19 dashboard.
- `services/api`: Express API gateway.
- `services/code-intelligence`: FastAPI Tree-sitter parser.
- `services/agent-worker`: Orchestrator and state machine.
- `packages/shared-types`: Canonical TypeScript interfaces and Zod schemas.
- `packages/config`: Common configuration validation.
- `infrastructure/docker`: Unified compose file and Dockerfiles.

### Trade-offs:
- *Pro*: Shared types between frontend, API, and worker prevent contract drift.
- *Pro*: Single source of truth for dependencies and scripts while keeping language ecosystems isolated.
- *Con*: Requires dual toolchains (Node.js + Python). Resolved by containerizing each service independently.

---

## ADR 002: Dual-Engine Backend (Express + FastAPI)

### Context:
AST parsing and code intelligence libraries (such as Tree-sitter bindings, PyTorch/vector embeddings, and tokenizers) have mature native bindings in Python. Conversely, web application APIs, JSON schema validation, and dev-server tooling excel in TypeScript/Node.js.

### Decision:
Split the backend into:
1. `services/api` (Node.js/Express): Gateway handling HTTP client requests, task lifecycles, and health aggregation.
2. `services/code-intelligence` (Python/FastAPI): Specialized AST parsing, symbol graph generation, and future embedding indexer.

### Trade-offs:
- *Pro*: Leverages the best tooling for each domain: high-speed TypeScript web server + robust Python data/AST stack.
- *Con*: Requires an internal RPC/HTTP boundary. Managed via strict health checks and typed contracts.

---

## ADR 003: Runtime Validation with Zod

### Context:
TypeScript types are erased at runtime. Incoming HTTP payloads from users, Git webhooks, and future LLM tool calls must be strictly validated before processing.

### Decision:
Use Zod schemas in `packages/shared-types` for every external entity: `CreateRepositorySchema`, `CreateTaskSchema`, `ApiConfigSchema`. Derive static TypeScript types directly from Zod using `z.infer`.

### Trade-offs:
- *Pro*: Single source of truth for both static typing and runtime validation.
- *Pro*: Descriptive, human-readable error messages for client forms.
- *Con*: Negligible runtime parsing overhead, acceptable for developer-tool workloads.

---

## ADR 004: Anti-Slop Frontend Design Language

### Context:
Many AI developer tools suffer from generic "AI slop" aesthetics: purple candy badges, non-functional telemetry tickers, pill capsules on static metadata, and fabricated scorecards.

### Decision:
Enforce the Frontend Design Constitution:
- Dark charcoal canvas (`#0a0c10` / `neutral-950`) with restrained indigo accents.
- Zero-pill discipline: Unboxed text with subtle typographic bullet separators (`·`) for metadata.
- Interactive filter controls are clean segmented button tabs, not candy chips.
- Tabular figures (`tabular-nums`) for all numbers and timestamps to prevent layout jitter.
- Real health checks: Status dots and latency meters reflect true API reachability, with honest offline and degraded states.
