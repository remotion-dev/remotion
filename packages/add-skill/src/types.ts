export type AgentType =
  | 'amp'
  | 'antigravity'
  | 'claude-code'
  | 'clawdbot'
  | 'cline'
  | 'codebuddy'
  | 'codex'
  | 'command-code'
  | 'cursor'
  | 'droid'
  | 'gemini-cli'
  | 'github-copilot'
  | 'goose'
  | 'kilo'
  | 'kiro-cli'
  | 'mcpjam'
  | 'neovate'
  | 'opencode'
  | 'openhands'
  | 'pi'
  | 'qoder'
  | 'qwen-code'
  | 'roo'
  | 'trae'
  | 'windsurf'
  | 'zencoder';

export interface Skill {
  name: string;
  description: string;
  path: string;
  /** Raw SKILL.md content for hashing */
  rawContent?: string;
  metadata?: Record<string, string>;
}

export interface AgentConfig {
  name: string;
  displayName: string;
  skillsDir: string;
  globalSkillsDir: string;
  detectInstalled: () => Promise<boolean>;
}

export interface ParsedSource {
  type: 'github' | 'gitlab' | 'git' | 'local' | 'direct-url';
  url: string;
  subpath?: string;
  localPath?: string;
  ref?: string;
}

export interface MintlifySkill {
  name: string;
  description: string;
  content: string;
  mintlifySite: string;
  sourceUrl: string;
}

/**
 * Represents a skill fetched from a remote host provider.
 */
export interface RemoteSkill {
  /** Display name of the skill (from frontmatter) */
  name: string;
  /** Description of the skill (from frontmatter) */
  description: string;
  /** Full markdown content including frontmatter */
  content: string;
  /** The identifier used for installation directory name */
  installName: string;
  /** The original source URL */
  sourceUrl: string;
  /** The provider that fetched this skill */
  providerId: string;
  /** Source identifier for telemetry (e.g., "mintlify/bun.com") */
  sourceIdentifier: string;
  /** Any additional metadata from frontmatter */
  metadata?: Record<string, unknown>;
}
