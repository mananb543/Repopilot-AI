# RepoPilot AI — API Contracts Specification

## Base URLs
- Express API Gateway: `http://localhost:3000/api` (or `:3001` in multi-container topology)
- Code Intelligence Service: `http://localhost:8000`

---

## 1. Express API Endpoints

### `GET /api/health`
Returns structured service health status, uptime, environment, and downstream component checks.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "repopilot-api",
  "version": "0.1.0-phase1",
  "timestamp": "2026-10-14T12:00:00.000Z",
  "environment": "development",
  "uptimeSeconds": 142,
  "components": {
    "database": {
      "status": "unconfigured",
      "message": "In-memory state active (PostgreSQL with pgvector planned for Phase 2)"
    },
    "codeIntelligence": {
      "status": "online",
      "endpoint": "http://127.0.0.1:8000",
      "latencyMs": 4
    },
    "agentWorker": {
      "status": "idle"
    }
  }
}
```

---

### `GET /api/repositories`
Lists registered Git repositories.

**Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "repo-sample-1",
      "provider": "github",
      "owner": "expressjs",
      "name": "express",
      "fullName": "expressjs/express",
      "url": "https://github.com/expressjs/express",
      "defaultBranch": "master",
      "connectionStatus": "connected",
      "createdAt": "2026-10-13T12:00:00.000Z",
      "updatedAt": "2026-10-13T12:00:00.000Z"
    }
  ],
  "total": 1,
  "storageEngine": "in-memory (Phase 1 foundation)"
}
```

---

### `POST /api/repositories`
Registers a repository URL. Validated via Zod.

**Request Body**:
```json
{
  "url": "https://github.com/facebook/react",
  "defaultBranch": "main"
}
```

**Response `201 Created`**:
```json
{
  "message": "Repository registered successfully in Phase 1 workspace registry",
  "data": {
    "id": "repo-1742080000-xyz",
    "provider": "github",
    "owner": "facebook",
    "name": "react",
    "fullName": "facebook/react",
    "url": "https://github.com/facebook/react",
    "defaultBranch": "main",
    "connectionStatus": "connected",
    "createdAt": "2026-10-14T12:05:00.000Z",
    "updatedAt": "2026-10-14T12:05:00.000Z"
  }
}
```

---

### `GET /api/tasks`
Lists registered engineering tasks.

**Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "task-sample-1",
      "repositoryId": "repo-sample-1",
      "title": "Audit TypeScript definitions",
      "description": "Inspect middleware export contracts...",
      "status": "created",
      "currentPhase": "idle",
      "priority": "medium",
      "createdAt": "2026-10-14T11:30:00.000Z",
      "updatedAt": "2026-10-14T11:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/tasks`
Creates a new engineering task for the autonomous agent.

**Request Body**:
```json
{
  "repositoryId": "repo-sample-1",
  "title": "Fix token expiration in OAuth middleware",
  "description": "When access token expires, refresh token exchange fails silently without retry.",
  "priority": "high"
}
```

---

### `GET /api/config-status`
Provides safe inspection of configured model providers and environment statuses without leaking secret keys.

---

## 2. Code Intelligence FastAPI Endpoints

### `GET /health`
Returns Python runtime health, uptime, and Tree-sitter supported language grammars.

### `GET /api/v1/capabilities`
Returns AST parser capabilities and limits.

### `POST /api/v1/ast/parse-preview`
Submits source code for AST symbol detection.
