#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "RepoPilot AI — Monorepo Verification"
echo "=========================================="

echo "[1/4] Checking Node.js and TypeScript environment..."
node -v
npm -v
npx tsc --noEmit
echo "TypeScript check: PASSED"

echo "[2/4] Testing shared contracts validation with Zod..."
node --input-type=module -e '
import { CreateRepositorySchema, CreateTaskSchema } from "./packages/shared-types/src/index.ts";

// Test valid repo
const validRepo = CreateRepositorySchema.safeParse({
  url: "https://github.com/facebook/react",
  defaultBranch: "main"
});
if (!validRepo.success) throw new Error("Valid repo failed validation");

// Test invalid repo
const invalidRepo = CreateRepositorySchema.safeParse({
  url: "not-a-url"
});
if (invalidRepo.success) throw new Error("Invalid repo unexpectedly passed");

// Test valid task
const validTask = CreateTaskSchema.safeParse({
  repositoryId: "repo-1",
  title: "Test Task Title",
  description: "A valid engineering task description with more than 10 chars",
  priority: "high"
});
if (!validTask.success) throw new Error("Valid task failed validation");

console.log("Shared Contracts Zod Validation: PASSED");
'

echo "[3/4] Verifying Python code intelligence syntax & manifests..."
python3 -m py_compile services/code-intelligence/main.py services/code-intelligence/config.py
test -f services/code-intelligence/requirements.txt
test -f services/code-intelligence/pyproject.toml
echo "Python syntax and manifest verification: PASSED"

echo "[4/4] Verifying Docker and documentation assets..."
test -f infrastructure/docker/docker-compose.yml
test -f infrastructure/docker/Dockerfile.api
test -f infrastructure/docker/Dockerfile.web
test -f infrastructure/docker/Dockerfile.code-intelligence
test -f infrastructure/docker/Dockerfile.agent-worker
test -f docs/architecture.md
test -f docs/implementation-roadmap.md
test -f docs/security.md
test -f docs/decisions.md
test -f docs/api-contracts.md
echo "Documentation & Docker configs: VERIFIED"

echo "=========================================="
echo "ALL VERIFICATION CHECKS PASSED SUCCESSFULLY"
echo "=========================================="
