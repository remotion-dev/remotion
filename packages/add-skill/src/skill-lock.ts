import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

const AGENTS_DIR = '.agents';
const LOCK_FILE = '.skill-lock.json';
const CURRENT_VERSION = 3; // Bumped from 2 to 3 for folder hash support (GitHub tree SHA)

/**
 * Represents a single installed skill entry in the lock file.
 */
export interface SkillLockEntry {
  /** Normalized source identifier (e.g., "owner/repo", "mintlify/bun.com") */
  source: string;
  /** The provider/source type (e.g., "github", "mintlify", "huggingface", "local") */
  sourceType: string;
  /** The original URL used to install the skill (for re-fetching updates) */
  sourceUrl: string;
  /** Subpath within the source repo, if applicable */
  skillPath?: string;
  /**
   * GitHub tree SHA for the entire skill folder.
   * This hash changes when ANY file in the skill folder changes.
   * Fetched via GitHub Trees API by the telemetry server.
   */
  skillFolderHash: string;
  /** ISO timestamp when the skill was first installed */
  installedAt: string;
  /** ISO timestamp when the skill was last updated */
  updatedAt: string;
}

/**
 * The structure of the skill lock file.
 */
export interface SkillLockFile {
  /** Schema version for future migrations */
  version: number;
  /** Map of skill name to its lock entry */
  skills: Record<string, SkillLockEntry>;
}

/**
 * Get the path to the global skill lock file.
 * Located at ~/.agents/.skill-lock.json
 */
export function getSkillLockPath(): string {
  return join(homedir(), AGENTS_DIR, LOCK_FILE);
}

/**
 * Read the skill lock file.
 * Returns an empty lock file structure if the file doesn't exist.
 * Wipes the lock file if it's an old format (version < CURRENT_VERSION).
 */
export async function readSkillLock(): Promise<SkillLockFile> {
  const lockPath = getSkillLockPath();

  try {
    const content = await readFile(lockPath, 'utf-8');
    const parsed = JSON.parse(content) as SkillLockFile;

    // Validate version - wipe if old format
    if (typeof parsed.version !== 'number' || !parsed.skills) {
      return createEmptyLockFile();
    }

    // If old version, wipe and start fresh (backwards incompatible change)
    // v3 adds skillFolderHash - we want fresh installs to populate it
    if (parsed.version < CURRENT_VERSION) {
      return createEmptyLockFile();
    }

    return parsed;
  } catch (error) {
    // File doesn't exist or is invalid - return empty
    return createEmptyLockFile();
  }
}

/**
 * Write the skill lock file.
 * Creates the directory if it doesn't exist.
 */
export async function writeSkillLock(lock: SkillLockFile): Promise<void> {
  const lockPath = getSkillLockPath();

  // Ensure directory exists
  await mkdir(dirname(lockPath), { recursive: true });

  // Write with pretty formatting for human readability
  const content = JSON.stringify(lock, null, 2);
  await writeFile(lockPath, content, 'utf-8');
}

/**
 * Compute SHA-256 hash of content.
 */
export function computeContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Fetch the tree SHA (folder hash) for a skill folder using GitHub's Trees API.
 * This makes ONE API call to get the entire repo tree, then extracts the SHA
 * for the specific skill folder.
 *
 * @param ownerRepo - GitHub owner/repo (e.g., "vercel-labs/agent-skills")
 * @param skillPath - Path to skill folder or SKILL.md (e.g., "skills/react-best-practices/SKILL.md")
 * @returns The tree SHA for the skill folder, or null if not found
 */
export async function fetchSkillFolderHash(
  ownerRepo: string,
  skillPath: string
): Promise<string | null> {
  // Normalize the skill path - remove SKILL.md suffix to get folder path
  let folderPath = skillPath;
  if (folderPath.endsWith('/SKILL.md')) {
    folderPath = folderPath.slice(0, -9);
  } else if (folderPath.endsWith('SKILL.md')) {
    folderPath = folderPath.slice(0, -8);
  }
  if (folderPath.endsWith('/')) {
    folderPath = folderPath.slice(0, -1);
  }

  const branches = ['main', 'master'];

  for (const branch of branches) {
    try {
      const url = `https://api.github.com/repos/${ownerRepo}/git/trees/${branch}?recursive=1`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'add-skill-cli',
        },
      });

      if (!response.ok) continue;

      const data = (await response.json()) as {
        sha: string;
        tree: Array<{ path: string; type: string; sha: string }>;
      };

      // If folderPath is empty, this is a root-level skill - use the root tree SHA
      if (!folderPath) {
        return data.sha;
      }

      // Find the tree entry for the skill folder
      const folderEntry = data.tree.find(
        (entry) => entry.type === 'tree' && entry.path === folderPath
      );

      if (folderEntry) {
        return folderEntry.sha;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Add or update a skill entry in the lock file.
 */
export async function addSkillToLock(
  skillName: string,
  entry: Omit<SkillLockEntry, 'installedAt' | 'updatedAt'>
): Promise<void> {
  const lock = await readSkillLock();
  const now = new Date().toISOString();

  const existingEntry = lock.skills[skillName];

  lock.skills[skillName] = {
    ...entry,
    installedAt: existingEntry?.installedAt ?? now,
    updatedAt: now,
  };

  await writeSkillLock(lock);
}

/**
 * Remove a skill from the lock file.
 */
export async function removeSkillFromLock(skillName: string): Promise<boolean> {
  const lock = await readSkillLock();

  if (!(skillName in lock.skills)) {
    return false;
  }

  delete lock.skills[skillName];
  await writeSkillLock(lock);
  return true;
}

/**
 * Get a skill entry from the lock file.
 */
export async function getSkillFromLock(skillName: string): Promise<SkillLockEntry | null> {
  const lock = await readSkillLock();
  return lock.skills[skillName] ?? null;
}

/**
 * Get all skills from the lock file.
 */
export async function getAllLockedSkills(): Promise<Record<string, SkillLockEntry>> {
  const lock = await readSkillLock();
  return lock.skills;
}

/**
 * Get skills grouped by source for batch update operations.
 */
export async function getSkillsBySource(): Promise<
  Map<string, { skills: string[]; entry: SkillLockEntry }>
> {
  const lock = await readSkillLock();
  const bySource = new Map<string, { skills: string[]; entry: SkillLockEntry }>();

  for (const [skillName, entry] of Object.entries(lock.skills)) {
    const existing = bySource.get(entry.source);
    if (existing) {
      existing.skills.push(skillName);
    } else {
      bySource.set(entry.source, { skills: [skillName], entry });
    }
  }

  return bySource;
}

/**
 * Create an empty lock file structure.
 */
function createEmptyLockFile(): SkillLockFile {
  return {
    version: CURRENT_VERSION,
    skills: {},
  };
}
