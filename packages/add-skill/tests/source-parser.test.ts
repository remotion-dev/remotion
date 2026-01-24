#!/usr/bin/env tsx

/**
 * Unit tests for source-parser.ts
 *
 * These tests verify the URL parsing logic - they don't make network requests
 * or clone repositories. They ensure that given a URL string, the parser
 * correctly extracts type, url, ref (branch), and subpath.
 *
 * Run with: npx tsx tests/source-parser.test.ts
 */

import assert from 'node:assert';
import { getOwnerRepo, parseSource } from '../src/source-parser.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.error(`  ${(err as Error).message}`);
    failed++;
  }
}

// GitHub URL tests
test('GitHub URL - basic repo', () => {
  const result = parseSource('https://github.com/owner/repo');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.ref, undefined);
  assert.strictEqual(result.subpath, undefined);
});

test('GitHub URL - with .git suffix', () => {
  const result = parseSource('https://github.com/owner/repo.git');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
});

test('GitHub URL - tree with branch only', () => {
  const result = parseSource('https://github.com/owner/repo/tree/feature-branch');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.ref, 'feature-branch');
  assert.strictEqual(result.subpath, undefined);
});

test('GitHub URL - tree with branch and path', () => {
  const result = parseSource('https://github.com/owner/repo/tree/main/skills/my-skill');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.ref, 'main');
  assert.strictEqual(result.subpath, 'skills/my-skill');
});

// Note: Branch names with slashes (e.g., feature/my-feature) are ambiguous.
// The parser treats the first segment as branch and rest as path.
// This matches GitHub's URL structure behavior.
test('GitHub URL - tree with slash in path (ambiguous branch)', () => {
  const result = parseSource('https://github.com/owner/repo/tree/feature/my-feature');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.ref, 'feature');
  assert.strictEqual(result.subpath, 'my-feature');
});

// GitLab URL tests
test('GitLab URL - basic repo', () => {
  const result = parseSource('https://gitlab.com/owner/repo');
  assert.strictEqual(result.type, 'gitlab');
  assert.strictEqual(result.url, 'https://gitlab.com/owner/repo.git');
  assert.strictEqual(result.ref, undefined);
});

test('GitLab URL - tree with branch only', () => {
  const result = parseSource('https://gitlab.com/owner/repo/-/tree/develop');
  assert.strictEqual(result.type, 'gitlab');
  assert.strictEqual(result.url, 'https://gitlab.com/owner/repo.git');
  assert.strictEqual(result.ref, 'develop');
  assert.strictEqual(result.subpath, undefined);
});

test('GitLab URL - tree with branch and path', () => {
  const result = parseSource('https://gitlab.com/owner/repo/-/tree/main/src/skills');
  assert.strictEqual(result.type, 'gitlab');
  assert.strictEqual(result.url, 'https://gitlab.com/owner/repo.git');
  assert.strictEqual(result.ref, 'main');
  assert.strictEqual(result.subpath, 'src/skills');
});

// GitHub shorthand tests
test('GitHub shorthand - owner/repo', () => {
  const result = parseSource('owner/repo');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.ref, undefined);
  assert.strictEqual(result.subpath, undefined);
});

test('GitHub shorthand - owner/repo/path', () => {
  const result = parseSource('owner/repo/skills/my-skill');
  assert.strictEqual(result.type, 'github');
  assert.strictEqual(result.url, 'https://github.com/owner/repo.git');
  assert.strictEqual(result.subpath, 'skills/my-skill');
});

// Local path tests
test('Local path - relative with ./', () => {
  const result = parseSource('./my-skills');
  assert.strictEqual(result.type, 'local');
  assert.ok(result.localPath?.endsWith('my-skills'));
});

test('Local path - relative with ../', () => {
  const result = parseSource('../other-skills');
  assert.strictEqual(result.type, 'local');
  assert.ok(result.localPath?.includes('other-skills'));
});

test('Local path - current directory', () => {
  const result = parseSource('.');
  assert.strictEqual(result.type, 'local');
  assert.ok(result.localPath);
});

test('Local path - absolute path', () => {
  const result = parseSource('/home/user/skills');
  assert.strictEqual(result.type, 'local');
  assert.strictEqual(result.localPath, '/home/user/skills');
});

// Git URL fallback tests
test('Git URL - SSH format', () => {
  const result = parseSource('git@github.com:owner/repo.git');
  assert.strictEqual(result.type, 'git');
  assert.strictEqual(result.url, 'git@github.com:owner/repo.git');
});

test('Git URL - custom host', () => {
  const result = parseSource('https://git.example.com/owner/repo.git');
  assert.strictEqual(result.type, 'git');
  assert.strictEqual(result.url, 'https://git.example.com/owner/repo.git');
});

// getOwnerRepo tests - for telemetry normalization
test('getOwnerRepo - GitHub URL', () => {
  const parsed = parseSource('https://github.com/owner/repo');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitHub URL with .git', () => {
  const parsed = parseSource('https://github.com/owner/repo.git');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitHub URL with tree/branch/path', () => {
  const parsed = parseSource('https://github.com/owner/repo/tree/main/skills/my-skill');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitHub shorthand', () => {
  const parsed = parseSource('owner/repo');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitHub shorthand with subpath', () => {
  const parsed = parseSource('owner/repo/skills/my-skill');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitLab URL', () => {
  const parsed = parseSource('https://gitlab.com/owner/repo');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - GitLab URL with tree', () => {
  const parsed = parseSource('https://gitlab.com/owner/repo/-/tree/main/skills');
  assert.strictEqual(getOwnerRepo(parsed), 'owner/repo');
});

test('getOwnerRepo - local path returns null', () => {
  const parsed = parseSource('./my-skills');
  assert.strictEqual(getOwnerRepo(parsed), null);
});

test('getOwnerRepo - absolute local path returns null', () => {
  const parsed = parseSource('/home/user/skills');
  assert.strictEqual(getOwnerRepo(parsed), null);
});

test('getOwnerRepo - custom git host returns null', () => {
  const parsed = parseSource('https://git.example.com/owner/repo.git');
  assert.strictEqual(getOwnerRepo(parsed), null);
});

test('getOwnerRepo - SSH format returns null', () => {
  const parsed = parseSource('git@github.com:owner/repo.git');
  assert.strictEqual(getOwnerRepo(parsed), null);
});

test('getOwnerRepo - private GitLab instance returns null', () => {
  // This falls through to 'git' type since it's not gitlab.com
  const parsed = parseSource('https://gitlab.company.com/team/repo');
  assert.strictEqual(getOwnerRepo(parsed), null);
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
