# RepoPilot AI

> **Autonomous software engineering agent and code intelligence platform foundation.**

RepoPilot AI is a developer tool that accepts a GitHub repository and a software engineering issue, parses the codebase using Abstract Syntax Trees (AST), retrieves relevant code context, synthesizes multi-step implementation plans, modifies files within bounded safety constraints, executes containerized test suites, and presents a verified pull request patch.

---

## Phase 1: Project Foundation and Architecture

This repository contains the **Phase 1 Foundation**:
- **Monorepo Architecture**: Clean separation between frontend dashboard, Express API gateway, FastAPI code intelligence service, and shared packages.
- **Data Contracts**: Shared TypeScript models and Zod runtime validators for `Repository`, `AgentTask`, `AgentEvent`, and `HealthResponse`.
- **Developer Dashboard**: High-fidelity React 19 interface adhering to anti-slop frontend design principles (zero-pill metadata, dark theme, tabular figures, and accessible modals).
- **Service Health Probes**: Real-time health checks on `GET /api/health` and `GET /health` with latency metrics and offline recovery handling.
- **Safety Boundaries**: Architecture specifications for bounded agent loops (max 20 iterations, 600s timeout, max 3 repair attempts, zero arbitrary shell execution).

---

## Monorepo Layout

```
repopilot/
├── apps/
│   └── web/                   # React 19 SPA dashboard
├── services/
│   ├── api/                   # Express API gateway with Zod validation
│   ├── agent-worker/          # Bounded agent orchestrator & state machine
│   └── code-intelligence/     # FastAPI service for Tree-sitter AST parsing
├── packages/
│   ├── shared-types/          # Canonical TypeScript interfaces & Zod schemas
│   └── config/                # Environment configuration & validation
├── infrastructure/
│   └── docker/                # Container definitions & docker-compose topology
├── docs/                      # Architecture, roadmap, security, decisions, and API contracts
├── scripts/                   # Verification and health check utilities
├── .env.example               # Environment variables specification
├── .gitignore                 # Exclusion rules
├── package.json               # Root monorepo scripts & dependencies
└── server.ts                  # Root full-stack dev server (Express + Vite)
```

---

## Prerequisites

- **Node.js**: `v20.0.0` or higher (`v22` recommended)
- **npm**: `v10.0.0` or higher
- **Python**: `3.10` or higher (for `services/code-intelligence`)
- **Docker & Docker Compose**: Optional for containerized topology

---

## Quickstart & Development

### 1. Installation
Clone the repository and install root Node dependencies:
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Run Development Server
Start the unified full-stack server (runs Express API on `/api/*` and mounts Vite dev server for the React dashboard on port 3000):
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Code Intelligence (FastAPI)
In a separate terminal or virtual environment:
```bash
cd services/code-intelligence
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Verification & Health Checks

Run the automated verification suite to validate TypeScript compilation, Zod schemas, and Python configs:
```bash
chmod +x scripts/verify.sh
./scripts/verify.sh
```

Check backend health endpoints:
```bash
chmod +x scripts/check-health.sh
./scripts/check-health.sh
```

Or run TypeScript type checking directly:
```bash
npm run lint
```

---

## Docker Deployment

To launch the multi-container stack with PostgreSQL, Redis, Express API, FastAPI, and React Web:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```

---

## Documentation

- [Architecture Specification](docs/architecture.md): Service boundaries and data flow.
- [Implementation Roadmap](docs/implementation-roadmap.md): Staged milestones from Phase 1 to Phase 5.
- [Security Requirements](docs/security.md): Threat model, sandboxing, and non-negotiable invariants.
- [Architectural Decisions (ADRs)](docs/decisions.md): Trade-offs, rationale, and design choices.
- [API Contracts](docs/api-contracts.md): Complete REST endpoint documentation and schemas.

---

## Troubleshooting

- **API Offline status in Header**: Verify that `server.ts` is running on port 3000. If running behind a reverse proxy or alternate port, set `VITE_API_BASE_URL` in `.env`.
- **TypeScript path alias errors**: Ensure your IDE recognizes `paths` defined in `tsconfig.json` (`@repopilot/shared-types`, `@repopilot/config`).
- **Python AST dependencies**: If Tree-sitter build fails during `pip install`, ensure standard C build tools (`gcc` / `build-essential`) and Python dev headers are installed.
