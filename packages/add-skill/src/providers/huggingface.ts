import matter from 'gray-matter';
import type { HostProvider, ProviderMatch, RemoteSkill } from './types.js';

/**
 * HuggingFace Spaces skills provider.
 *
 * HuggingFace skills are hosted in HuggingFace Spaces repositories.
 *
 * URL formats supported:
 * - https://huggingface.co/spaces/{owner}/{repo}/blob/main/SKILL.md (web view)
 * - https://huggingface.co/spaces/{owner}/{repo}/raw/main/SKILL.md (raw content)
 *
 * The source identifier is "huggingface/{owner}/{repo}".
 * The install name defaults to the repo name, but can be overridden with
 * frontmatter `metadata.install-name`.
 */
export class HuggingFaceProvider implements HostProvider {
  readonly id = 'huggingface';
  readonly displayName = 'HuggingFace';

  private readonly HOST = 'huggingface.co';

  match(url: string): ProviderMatch {
    // Must be a valid HTTP(S) URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { matches: false };
    }

    // Must be huggingface.co
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== this.HOST) {
        return { matches: false };
      }
    } catch {
      return { matches: false };
    }

    // Must end with SKILL.md (case insensitive)
    if (!url.toLowerCase().endsWith('/skill.md')) {
      return { matches: false };
    }

    // Must be a spaces URL
    if (!url.includes('/spaces/')) {
      return { matches: false };
    }

    return { matches: true };
  }

  async fetchSkill(url: string): Promise<RemoteSkill | null> {
    try {
      // Convert to raw URL
      const rawUrl = this.toRawUrl(url);
      const response = await fetch(rawUrl);

      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      const { data } = matter(content);

      // Must have name and description
      if (!data.name || !data.description) {
        return null;
      }

      // Extract owner/repo from URL for install name
      const parsed = this.parseUrl(url);
      if (!parsed) {
        return null;
      }

      // Use metadata.install-name if provided, otherwise use repo name
      const installName = data.metadata?.['install-name'] || parsed.repo;

      return {
        name: data.name,
        description: data.description,
        content,
        installName,
        sourceUrl: url,
        metadata: data.metadata,
      };
    } catch {
      return null;
    }
  }

  toRawUrl(url: string): string {
    // Convert blob URL to raw URL
    // https://huggingface.co/spaces/owner/repo/blob/main/SKILL.md
    // -> https://huggingface.co/spaces/owner/repo/raw/main/SKILL.md
    return url.replace('/blob/', '/raw/');
  }

  getSourceIdentifier(url: string): string {
    const parsed = this.parseUrl(url);
    if (!parsed) {
      return 'huggingface/unknown';
    }
    return `huggingface/${parsed.owner}/${parsed.repo}`;
  }

  /**
   * Parse a HuggingFace Spaces URL to extract owner and repo.
   */
  private parseUrl(url: string): { owner: string; repo: string } | null {
    // Match: /spaces/{owner}/{repo}/
    const match = url.match(/\/spaces\/([^/]+)\/([^/]+)/);
    if (!match || !match[1] || !match[2]) {
      return null;
    }
    return {
      owner: match[1],
      repo: match[2],
    };
  }
}

export const huggingFaceProvider = new HuggingFaceProvider();
