# RepoPilot AI — Implementation Roadmap

This document outlines the staged development lifecycle for RepoPilot AI. Each phase builds upon the verified foundation of preceding milestones.

---

## Phase 1: Project Foundation & Architecture (Current Phase)

**Objective**: Establish the monorepo architecture, data contracts, runtime validation, Express & FastAPI health check endpoints, and developer dashboard.

### Deliverables:
- [x] Monorepo workspace structure (`apps/web`, `services/api`, `services/code-intelligence`, `services/agent-worker`, `packages/shared-types`, `packages/config`, `infrastructure/docker`).
- [x] Shared TypeScript contracts and Zod runtime validators (`Repository`, `AgentTask`, `AgentEvent`, `HealthResponse`).
- [x] Express API with centralized error handling, `/api/health`, `/api/repositories`, `/api/tasks`, and `/api/config-status`.
- [x] FastAPI Code Intelligence service with `/health` and AST parser preview endpoint.
- [x] React developer console following anti-slop frontend design principles (zero-pill metadata, dark theme, tabular figures, accessible modals).
- [x] Real health checks with latency telemetry and honest offline/error states.
- [x] Docker definitions and docker-compose orchestration topology.
- [x] Comprehensive architectural and security documentation.

---

## Phase 2: Repository Ingestion & Hybrid Code Intelligence

**Objective**: Enable automated repository cloning, Tree-sitter abstract syntax tree parsing, and hybrid retrieval (BM25 keyword search + dense vector embeddings).

### Planned Scope:
- **Repository Cloner**: Shallow Git clone with authentication token support into isolated disk quotas.
- **Tree-sitter Parsing Pipeline**: AST extraction of symbols, functions, classes, interfaces, docstrings, and call-graphs across Python, TypeScript, JavaScript, Go, and Rust.
- **Persistence Layer**: PostgreSQL database setup with pgvector extension enabled.
- **Hybrid Retrieval**: BM25 keyword index combined with dense code embeddings using Reciprocal Rank Fusion (RRF).

---

## Phase 3: Autonomous Agent Core & Bounded Tool Calling

**Objective**: Implement the reasoning loop, stateful task execution machine, and real-time event streaming.

### Planned Scope:
- **Model Provider Adapter**: Unified interface for Google Gemini, Anthropic Claude, and OpenAI with structured JSON schema outputs.
- **Tool Registry**:
  - `find_symbol_definition`
  - `search_codebase_hybrid`
  - `read_file_range`
  - `patch_file_content`
  - `list_directory_tree`
- **State Machine Enforcement**: State transitions strictly validated against `ALLOWED_TRANSITIONS`.
- **WebSocket Streaming**: Real-time push of `AgentEvent` payloads to the dashboard.
- **Execution Guardrails**: Maximum 20 iterations, 600s task timeout, 15 files modified ceiling.

---

## Phase 4: Containerized Sandbox & Test Execution

**Objective**: Hermetic, isolated execution of build tools, linters, and unit test suites with self-repair loops.

### Planned Scope:
- **Docker Execution Sandbox**: Ephemeral container spun up per task with dropped Linux capabilities (`CAP_DROP_ALL`), read-only root FS, and no internet access.
- **Test Runner Integration**: Automatic detection of `npm test`, `pytest`, `cargo test`, `go test`.
- **Bounded Self-Repair Loop**: Maximum 3 automated repair cycles parsing test failure traces and issuing targeted patches.

---

## Phase 5: Patch Verification, Diff Review & Production Deployment

**Objective**: Unified Git diff generation, branch creation, pull request generation, and production observability.

### Planned Scope:
- **Git Patch Engine**: Production of pristine unified diffs (`git diff`).
- **PR Generation**: Automatic GitHub/GitLab PR submission with structured Markdown summary (root cause, modified files, test verification logs).
- **Observability & Cost Tracking**: Token accounting per task, execution latency breakdown, and error taxonomy telemetry.
