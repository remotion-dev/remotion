#!/usr/bin/env tsx

/**
 * Unit tests for skill path calculation in telemetry.
 *
 * These tests verify that the relativePath calculation for skillFiles
 * correctly produces paths relative to the repo root, not the search path.
 *
 * Run with: npx tsx tests/skill-path.test.ts
 */

import assert from 'node:assert';

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

/**
 * Simulates the relativePath calculation from index.ts
 */
function calculateRelativePath(tempDir: string | null, skillPath: string): string | null {
  if (tempDir && skillPath === tempDir) {
    // Skill is at root level of repo
    return 'SKILL.md';
  } else if (tempDir && skillPath.startsWith(tempDir + '/')) {
    // Compute path relative to repo root (tempDir)
    return skillPath.slice(tempDir.length + 1) + '/SKILL.md';
  } else {
    // Local path - skip telemetry
    return null;
  }
}

// Test: skill at repo root
test('skill at repo root', () => {
  const tempDir = '/tmp/abc123';
  const skillPath = '/tmp/abc123';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, 'SKILL.md');
});

// Test: skill in skills/ subdirectory
test('skill in skills/ subdirectory', () => {
  const tempDir = '/tmp/abc123';
  const skillPath = '/tmp/abc123/skills/my-skill';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, 'skills/my-skill/SKILL.md');
});

// Test: skill in .claude/skills/ directory
test('skill in .claude/skills/ directory', () => {
  const tempDir = '/tmp/abc123';
  const skillPath = '/tmp/abc123/.claude/skills/my-skill';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, '.claude/skills/my-skill/SKILL.md');
});

// Test: skill in nested subdirectory
test('skill in nested subdirectory', () => {
  const tempDir = '/tmp/abc123';
  const skillPath = '/tmp/abc123/skills/.curated/advanced-skill';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, 'skills/.curated/advanced-skill/SKILL.md');
});

// Test: local path returns null
test('local path returns null', () => {
  const tempDir = null;
  const skillPath = '/Users/me/projects/my-skill';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, null);
});

// Test: path not under tempDir returns null
test('path not under tempDir returns null', () => {
  const tempDir = '/tmp/abc123';
  const skillPath = '/tmp/other/my-skill';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, null);
});

// Test: onmax/nuxt-skills case (the original bug report)
test('onmax/nuxt-skills: skill in skills/ts-library', () => {
  const tempDir = '/tmp/clone-xyz';
  // discoverSkills finds /tmp/clone-xyz/skills/ts-library/SKILL.md
  // skill.path = dirname(skillMdPath) = /tmp/clone-xyz/skills/ts-library
  const skillPath = '/tmp/clone-xyz/skills/ts-library';
  const result = calculateRelativePath(tempDir, skillPath);
  assert.strictEqual(result, 'skills/ts-library/SKILL.md');
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
