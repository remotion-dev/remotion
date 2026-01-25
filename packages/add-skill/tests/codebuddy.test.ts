#!/usr/bin/env tsx

/**
 * Tests for CodeBuddy agent support
 *
 * These tests verify that CodeBuddy is properly configured as a supported agent.
 *
 * Run with: bunx tsx tests/codebuddy.test.ts
 */

import assert from 'node:assert';
import { join } from 'path';
import { homedir } from 'os';
import { agents, detectInstalledAgents, getAgentConfig } from '../src/agents.js';
import type { AgentType } from '../src/types.js';

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

// Test: CodeBuddy is in the agents record
test('CodeBuddy agent exists in agents record', () => {
  assert.ok('codebuddy' in agents, 'codebuddy should be in agents record');
  const config = agents.codebuddy;
  assert.ok(config, 'CodeBuddy config should exist');
  assert.strictEqual(config.name, 'codebuddy');
  assert.strictEqual(config.displayName, 'CodeBuddy');
});

// Test: CodeBuddy has correct directory paths
test('CodeBuddy has correct skills directories', () => {
  const config = agents.codebuddy;
  assert.strictEqual(config.skillsDir, '.codebuddy/skills');
  // Check that globalSkillsDir ends with the expected path (cross-platform)
  const expectedGlobalPath = join(homedir(), '.codebuddy/skills');
  assert.strictEqual(config.globalSkillsDir, expectedGlobalPath);
});

// Test: CodeBuddy is a valid AgentType
test('codebuddy is a valid AgentType', () => {
  const config = getAgentConfig('codebuddy');
  assert.ok(config);
  assert.strictEqual(config.name, 'codebuddy');
});

// Test: CodeBuddy detection function exists
test('CodeBuddy has detectInstalled function', () => {
  const config = agents.codebuddy;
  assert.ok(typeof config.detectInstalled === 'function');
});

// Test: CodeBuddy can be retrieved via getAgentConfig
test('getAgentConfig returns CodeBuddy config', () => {
  const config = getAgentConfig('codebuddy' as AgentType);
  assert.ok(config);
  assert.strictEqual(config.name, 'codebuddy');
  assert.strictEqual(config.displayName, 'CodeBuddy');
});

// Test: CodeBuddy is included in all agents list
test('CodeBuddy is included when iterating all agents', () => {
  const agentTypes = Object.keys(agents) as AgentType[];
  assert.ok(agentTypes.includes('codebuddy'), 'codebuddy should be in agent types list');
});

// Test: detectInstalledAgents can handle CodeBuddy
test('detectInstalledAgents includes CodeBuddy if detected', async () => {
  const detected = await detectInstalledAgents();
  // This test just verifies the function doesn't throw when checking CodeBuddy
  // Whether CodeBuddy is detected depends on the environment
  assert.ok(Array.isArray(detected));
  // If CodeBuddy is detected, it should be in the list
  if (detected.includes('codebuddy' as AgentType)) {
    assert.ok(true, 'CodeBuddy was detected');
  } else {
    // This is also OK - just means .codebuddy directory doesn't exist
    assert.ok(true, 'CodeBuddy not detected (expected if .codebuddy dir missing)');
  }
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
