#!/usr/bin/env node

/**
 * Wrapper script to use the local @remotion/add-skill package
 * which includes CodeBuddy support.
 * 
 * Usage:
 *   node scripts/skills-add.js remotion-dev/skills [options]
 *   bun run skills:add remotion-dev/skills [options]
 */

const { spawn } = require('node:child_process');
const { resolve, join } = require('node:path');
const path = require('node:path');

const rootDir = resolve(__dirname, '..');
const addSkillPath = join(rootDir, 'packages/add-skill/dist/index.js');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/skills-add.js <source> [options]');
  console.error('Example: node scripts/skills-add.js remotion-dev/skills --yes');
  process.exit(1);
}

const child = spawn('node', [addSkillPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('error', (error) => {
  console.error('Error running add-skill:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
