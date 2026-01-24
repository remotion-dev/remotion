import matter from 'gray-matter';
import type { HostProvider, ProviderMatch, RemoteSkill } from './types.js';

/**
 * Mintlify-hosted skills provider.
 *
 * Mintlify skills are identified by:
 * 1. URL ending in /skill.md (case insensitive)
 * 2. Frontmatter containing `metadata.mintlify-proj`
 *
 * The `mintlify-proj` value is used as:
 * - The skill's installation directory name
 * - Part of the source identifier for telemetry
 *
 * Example URL: https://mintlify.com/docs/skill.md
 * Example frontmatter:
 * ```yaml
 * name: Mintlify Development
 * description: Build documentation with Mintlify
 * metadata:
 *   mintlify-proj: mintlify.com
 * ```
 */
export class MintlifyProvider implements HostProvider {
  readonly id = 'mintlify';
  readonly displayName = 'Mintlify';

  match(url: string): ProviderMatch {
    // Must be a valid HTTP(S) URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { matches: false };
    }

    // Must end with /skill.md (case insensitive)
    if (!url.toLowerCase().endsWith('/skill.md')) {
      return { matches: false };
    }

    // Exclude GitHub and GitLab - they have their own handling
    if (url.includes('github.com') || url.includes('gitlab.com')) {
      return { matches: false };
    }

    // Exclude HuggingFace - it has its own provider
    if (url.includes('huggingface.co')) {
      return { matches: false };
    }

    return { matches: true };
  }

  async fetchSkill(url: string): Promise<RemoteSkill | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      const { data } = matter(content);

      // Must have mintlify-proj in metadata
      const mintlifySite = data.metadata?.['mintlify-proj'];
      if (!mintlifySite) {
        return null;
      }

      // Must have name and description
      if (!data.name || !data.description) {
        return null;
      }

      return {
        name: data.name,
        description: data.description,
        content,
        installName: mintlifySite,
        sourceUrl: url,
        metadata: data.metadata,
      };
    } catch {
      return null;
    }
  }

  toRawUrl(url: string): string {
    // Mintlify URLs are already direct content URLs
    return url;
  }

  getSourceIdentifier(url: string): string {
    // For Mintlify, we use "mintlify/com" as the identifier
    // This groups all Mintlify skills together under a single "repo"
    // The individual skill name (mintlify-proj) serves as the skill identifier
    // Leaderboard URL: /mintlify/com/{skill-name}
    return 'mintlify/com';
  }
}

export const mintlifyProvider = new MintlifyProvider();
