/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { 
  Repository, 
  CreateRepositorySchema,
  RepositoryProvider,
} from '@repopilot/shared-types';

export const repositoriesRouter = Router();

// In-memory store for Phase 1 (clearly documented as non-persistent across restarts)
const repositoriesStore: Repository[] = [
  {
    id: 'repo-sample-1',
    provider: 'github',
    owner: 'expressjs',
    name: 'express',
    fullName: 'expressjs/express',
    url: 'https://github.com/expressjs/express',
    defaultBranch: 'master',
    connectionStatus: 'connected',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    metadata: {
      isPrivate: false,
      language: 'JavaScript',
      description: 'Fast, unopinionated, minimalist web framework for node.',
    },
  },
];

function parseRepoUrl(url: string): { provider: RepositoryProvider; owner: string; name: string; fullName: string } {
  let clean = url.trim();
  if (clean.endsWith('.git')) clean = clean.slice(0, -4);

  // HTTPS or SSH match
  const httpsMatch = clean.match(/^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/([^/]+)\/([^/]+)$/i);
  if (httpsMatch) {
    const domain = httpsMatch[1].toLowerCase();
    const provider: RepositoryProvider = domain.includes('github') ? 'github' : domain.includes('gitlab') ? 'gitlab' : 'bitbucket';
    const owner = httpsMatch[2];
    const name = httpsMatch[3];
    return { provider, owner, name, fullName: `${owner}/${name}` };
  }

  const sshMatch = clean.match(/^git@([^:]+):([^/]+)\/([^/]+)$/i);
  if (sshMatch) {
    const domain = sshMatch[1].toLowerCase();
    const provider: RepositoryProvider = domain.includes('github') ? 'github' : domain.includes('gitlab') ? 'gitlab' : 'bitbucket';
    const owner = sshMatch[2];
    const name = sshMatch[3];
    return { provider, owner, name, fullName: `${owner}/${name}` };
  }

  return { provider: 'github', owner: 'unknown', name: 'repo', fullName: 'unknown/repo' };
}

repositoriesRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    data: repositoriesStore,
    total: repositoriesStore.length,
    storageEngine: 'in-memory (Phase 1 foundation)',
  });
});

repositoriesRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateRepositorySchema.parse(req.body);
    const parsed = parseRepoUrl(validated.url);

    // Check for duplicate
    const existing = repositoriesStore.find(r => r.fullName.toLowerCase() === parsed.fullName.toLowerCase());
    if (existing) {
      return res.status(409).json({
        error: `Repository ${parsed.fullName} is already registered.`,
        data: existing,
      });
    }

    const newRepo: Repository = {
      id: `repo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider: parsed.provider,
      owner: parsed.owner,
      name: parsed.name,
      fullName: parsed.fullName,
      url: validated.url,
      defaultBranch: validated.defaultBranch || 'main',
      connectionStatus: 'connected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        isPrivate: false,
        description: 'Connected in Phase 1 metadata registry (remote cloning active in Phase 2)',
      },
    };

    repositoriesStore.push(newRepo);

    res.status(201).json({
      message: 'Repository registered successfully in Phase 1 workspace registry',
      data: newRepo,
    });
  } catch (err) {
    next(err);
  }
});
