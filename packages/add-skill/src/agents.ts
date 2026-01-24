import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import type { AgentConfig, AgentType } from './types.js';

const home = homedir();

export const agents: Record<AgentType, AgentConfig> = {
  amp: {
    name: 'amp',
    displayName: 'Amp',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.config/agents/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.config/amp'));
    },
  },
  antigravity: {
    name: 'antigravity',
    displayName: 'Antigravity',
    skillsDir: '.agent/skills',
    globalSkillsDir: join(home, '.gemini/antigravity/skills'),
    detectInstalled: async () => {
      return (
        existsSync(join(process.cwd(), '.agent')) || existsSync(join(home, '.gemini/antigravity'))
      );
    },
  },
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    skillsDir: '.claude/skills',
    globalSkillsDir: join(home, '.claude/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.claude'));
    },
  },
  clawdbot: {
    name: 'clawdbot',
    displayName: 'Clawdbot',
    skillsDir: 'skills',
    globalSkillsDir: join(home, '.clawdbot/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.clawdbot'));
    },
  },
  cline: {
    name: 'cline',
    displayName: 'Cline',
    skillsDir: '.cline/skills',
    globalSkillsDir: join(home, '.cline/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.cline'));
    },
  },
  codebuddy: {
    name: 'codebuddy',
    displayName: 'CodeBuddy',
    skillsDir: '.codebuddy/skills',
    globalSkillsDir: join(home, '.codebuddy/skills'),
    detectInstalled: async () => {
      return (
        existsSync(join(process.cwd(), '.codebuddy')) || existsSync(join(home, '.codebuddy'))
      );
    },
  },
  codex: {
    name: 'codex',
    displayName: 'Codex',
    skillsDir: '.codex/skills',
    globalSkillsDir: join(home, '.codex/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.codex'));
    },
  },
  'command-code': {
    name: 'command-code',
    displayName: 'Command Code',
    skillsDir: '.commandcode/skills',
    globalSkillsDir: join(home, '.commandcode/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.commandcode'));
    },
  },
  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    skillsDir: '.cursor/skills',
    globalSkillsDir: join(home, '.cursor/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.cursor'));
    },
  },
  droid: {
    name: 'droid',
    displayName: 'Droid',
    skillsDir: '.factory/skills',
    globalSkillsDir: join(home, '.factory/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.factory/skills'));
    },
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    skillsDir: '.gemini/skills',
    globalSkillsDir: join(home, '.gemini/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.gemini'));
    },
  },
  'github-copilot': {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    skillsDir: '.github/skills',
    globalSkillsDir: join(home, '.copilot/skills'),
    detectInstalled: async () => {
      return existsSync(join(process.cwd(), '.github')) || existsSync(join(home, '.copilot'));
    },
  },
  goose: {
    name: 'goose',
    displayName: 'Goose',
    skillsDir: '.goose/skills',
    globalSkillsDir: join(home, '.config/goose/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.config/goose'));
    },
  },
  kilo: {
    name: 'kilo',
    displayName: 'Kilo Code',
    skillsDir: '.kilocode/skills',
    globalSkillsDir: join(home, '.kilocode/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.kilocode'));
    },
  },
  'kiro-cli': {
    name: 'kiro-cli',
    displayName: 'Kiro CLI',
    skillsDir: '.kiro/skills',
    globalSkillsDir: join(home, '.kiro/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.kiro'));
    },
  },
  mcpjam: {
    name: 'mcpjam',
    displayName: 'MCPJam',
    skillsDir: '.mcpjam/skills',
    globalSkillsDir: join(home, '.mcpjam/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.mcpjam'));
    },
  },
  opencode: {
    name: 'opencode',
    displayName: 'OpenCode',
    skillsDir: '.opencode/skills',
    globalSkillsDir: join(home, '.config/opencode/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.config/opencode')) || existsSync(join(home, '.claude/skills'));
    },
  },
  openhands: {
    name: 'openhands',
    displayName: 'OpenHands',
    skillsDir: '.openhands/skills',
    globalSkillsDir: join(home, '.openhands/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.openhands'));
    },
  },
  pi: {
    name: 'pi',
    displayName: 'Pi',
    skillsDir: '.pi/skills',
    globalSkillsDir: join(home, '.pi/agent/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.pi/agent'));
    },
  },
  qoder: {
    name: 'qoder',
    displayName: 'Qoder',
    skillsDir: '.qoder/skills',
    globalSkillsDir: join(home, '.qoder/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.qoder'));
    },
  },
  'qwen-code': {
    name: 'qwen-code',
    displayName: 'Qwen Code',
    skillsDir: '.qwen/skills',
    globalSkillsDir: join(home, '.qwen/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.qwen'));
    },
  },
  roo: {
    name: 'roo',
    displayName: 'Roo Code',
    skillsDir: '.roo/skills',
    globalSkillsDir: join(home, '.roo/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.roo'));
    },
  },
  trae: {
    name: 'trae',
    displayName: 'Trae',
    skillsDir: '.trae/skills',
    globalSkillsDir: join(home, '.trae/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.trae'));
    },
  },
  windsurf: {
    name: 'windsurf',
    displayName: 'Windsurf',
    skillsDir: '.windsurf/skills',
    globalSkillsDir: join(home, '.codeium/windsurf/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.codeium/windsurf'));
    },
  },
  zencoder: {
    name: 'zencoder',
    displayName: 'Zencoder',
    skillsDir: '.zencoder/skills',
    globalSkillsDir: join(home, '.zencoder/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.zencoder'));
    },
  },
  neovate: {
    name: 'neovate',
    displayName: 'Neovate',
    skillsDir: '.neovate/skills',
    globalSkillsDir: join(home, '.neovate/skills'),
    detectInstalled: async () => {
      return existsSync(join(home, '.neovate'));
    },
  },
};

export async function detectInstalledAgents(): Promise<AgentType[]> {
  const installed: AgentType[] = [];

  for (const [type, config] of Object.entries(agents)) {
    if (await config.detectInstalled()) {
      installed.push(type as AgentType);
    }
  }

  return installed;
}

export function getAgentConfig(type: AgentType): AgentConfig {
  return agents[type];
}
