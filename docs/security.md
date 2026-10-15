# RepoPilot AI — Security Requirements & Boundary Model

## 1. Threat Model & Invariants

An autonomous coding agent interacts with untrusted code, executes shell commands, consumes third-party model APIs, and modifies production repositories. Without rigid architectural boundaries, these systems introduce remote code execution (RCE), token exhaustion, privilege escalation, and credential theft vectors.

RepoPilot AI adheres to four non-negotiable security invariants:

1. **Zero Untrusted Host Execution**: Repository code, test runners, and build tools NEVER execute directly on host infrastructure or developer machines.
2. **Strictly Bounded Agent Lifecycles**: Every agent execution loop is subject to hard resource budgets (iterations, timeout, memory, disk).
3. **Hermetic Credential Isolation**: API keys, OAuth tokens, and database passwords are never exposed to the frontend or injected into untrusted runner environments.
4. **No Arbitrary Shell Endpoints**: The backend API provides no endpoint that executes arbitrary user-supplied or model-supplied shell commands without parameter sanitization and container isolation.

---

## 2. Invariant Specifications

### A. Repository Ingestion & Cloning
- **Transport Restrictions**: Only HTTPS and authenticated SSH git clones are permitted. Local filesystem paths (`file://`) and arbitrary URLs are rejected by Zod validation.
- **Repository Quotas**: Maximum repository size limited to 500 MB. Repositories exceeding this quota are aborted during shallow clone.
- **Symlink & Path Traversal Prevention**: Tree walking algorithms reject directory traversal (`../`) and refuse to follow symlinks pointing outside the repository root.
- **Secret Scanning on Ingestion**: Repositories are scanned for `.env`, private keys (`id_rsa`), and API tokens prior to AST extraction.

### B. LLM Model Integration & Prompts
- **Server-Side Key Management**: Model API keys (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) reside exclusively in server-side process environment variables.
- **Prompt Injection Defense**: Repository content is tagged and isolated with XML/Markdown delimiters. Tool calls require structured JSON schema compliance.
- **Cost & Token Caps**: Global token budget per task (e.g., 200,000 tokens) with automatic circuit breakers to prevent runaway billing.

### C. Sandboxed Code & Test Execution (Phase 4)
- **Container Isolation**:
  - Base Image: Minimal Alpine or distroless images.
  - User: Non-root execution (`USER node` or `USER 1000:1000`).
  - Read-Only Root Filesystem: Container root filesystem is mounted read-only (`--read-only`), with ephemeral `/tmp` mounted via tmpfs.
  - Network Egress: Network egress disabled during test execution (`--network none`) to prevent exfiltration or external webhook pings.
  - Resource Constraints: Hard limits per test run (`--memory=2g`, `--cpus=2.0`, `--pids-limit=100`).
  - Capability Dropping: All Linux capabilities dropped (`--cap-drop=ALL`).

### D. Git Diff & Patch Safety
- **No Direct Push to Protected Branches**: RepoPilot creates isolated feature branches (`repopilot/patch-<task-id>`) and never pushes directly to `main` or `master`.
- **Pre-Commit Verification**: Diffs must pass automated linting and unit test execution before being flagged as verified.
