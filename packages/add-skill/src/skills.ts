import { readdir, readFile, stat } from 'fs/promises';
import { join, basename, dirname } from 'path';
import matter from 'gray-matter';
import type { Skill } from './types.js';

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__'];

async function hasSkillMd(dir: string): Promise<boolean> {
  try {
    const skillPath = join(dir, 'SKILL.md');
    const stats = await stat(skillPath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function parseSkillMd(skillMdPath: string): Promise<Skill | null> {
  try {
    const content = await readFile(skillMdPath, 'utf-8');
    const { data } = matter(content);

    if (!data.name || !data.description) {
      return null;
    }

    return {
      name: data.name,
      description: data.description,
      path: dirname(skillMdPath),
      rawContent: content,
      metadata: data.metadata,
    };
  } catch {
    return null;
  }
}

async function findSkillDirs(dir: string, depth = 0, maxDepth = 5): Promise<string[]> {
  const skillDirs: string[] = [];

  if (depth > maxDepth) return skillDirs;

  try {
    if (await hasSkillMd(dir)) {
      skillDirs.push(dir);
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.includes(entry.name)) {
        const subDirs = await findSkillDirs(join(dir, entry.name), depth + 1, maxDepth);
        skillDirs.push(...subDirs);
      }
    }
  } catch {
    // Ignore errors
  }

  return skillDirs;
}

export async function discoverSkills(basePath: string, subpath?: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  const seenNames = new Set<string>();
  const searchPath = subpath ? join(basePath, subpath) : basePath;

  // If pointing directly at a skill, return just that
  if (await hasSkillMd(searchPath)) {
    const skill = await parseSkillMd(join(searchPath, 'SKILL.md'));
    if (skill) {
      skills.push(skill);
      return skills;
    }
  }

  // Search common skill locations first
  const prioritySearchDirs = [
    searchPath,
    join(searchPath, 'skills'),
    join(searchPath, 'skills/.curated'),
    join(searchPath, 'skills/.experimental'),
    join(searchPath, 'skills/.system'),
    join(searchPath, '.agent/skills'),
    join(searchPath, '.agents/skills'),
    join(searchPath, '.claude/skills'),
    join(searchPath, '.cline/skills'),
    join(searchPath, '.codex/skills'),
    join(searchPath, '.commandcode/skills'),
    join(searchPath, '.cursor/skills'),
    join(searchPath, '.github/skills'),
    join(searchPath, '.goose/skills'),
    join(searchPath, '.kilocode/skills'),
    join(searchPath, '.kiro/skills'),
    join(searchPath, '.neovate/skills'),
    join(searchPath, '.opencode/skills'),
    join(searchPath, '.openhands/skills'),
    join(searchPath, '.pi/skills'),
    join(searchPath, '.qoder/skills'),
    join(searchPath, '.roo/skills'),
    join(searchPath, '.trae/skills'),
    join(searchPath, '.windsurf/skills'),
    join(searchPath, '.zencoder/skills'),
  ];

  for (const dir of prioritySearchDirs) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillDir = join(dir, entry.name);
          if (await hasSkillMd(skillDir)) {
            const skill = await parseSkillMd(join(skillDir, 'SKILL.md'));
            if (skill && !seenNames.has(skill.name)) {
              skills.push(skill);
              seenNames.add(skill.name);
            }
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  // Fall back to recursive search if nothing found
  if (skills.length === 0) {
    const allSkillDirs = await findSkillDirs(searchPath);

    for (const skillDir of allSkillDirs) {
      const skill = await parseSkillMd(join(skillDir, 'SKILL.md'));
      if (skill && !seenNames.has(skill.name)) {
        skills.push(skill);
        seenNames.add(skill.name);
      }
    }
  }

  return skills;
}

export function getSkillDisplayName(skill: Skill): string {
  return skill.name || basename(skill.path);
}
