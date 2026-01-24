import simpleGit from 'simple-git';
import { join, normalize, resolve, sep } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';

export async function cloneRepo(url: string, ref?: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), 'add-skill-'));
  const git = simpleGit();
  const cloneOptions = ref ? ['--depth', '1', '--branch', ref] : ['--depth', '1'];
  await git.clone(url, tempDir, cloneOptions);
  return tempDir;
}

export async function cleanupTempDir(dir: string): Promise<void> {
  // Validate that the directory path is within tmpdir to prevent deletion of arbitrary paths
  const normalizedDir = normalize(resolve(dir));
  const normalizedTmpDir = normalize(resolve(tmpdir()));

  if (!normalizedDir.startsWith(normalizedTmpDir + sep) && normalizedDir !== normalizedTmpDir) {
    throw new Error('Attempted to clean up directory outside of temp directory');
  }

  await rm(dir, { recursive: true, force: true });
}
