import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import type {GitSource} from '@remotion/studio-shared';
import {execSync} from 'child_process';
import {existsSync, readFileSync} from 'fs';
import path from 'path';
import {Log} from './log';

export type ParsedGitRemote = {
	type: 'github';
	org: string;
	name: string;
};

const getGitRemotes = (lines: string[]) => {
	const sections: string[][] = [];

	let open = false;
	for (const line of lines) {
		if (line.startsWith('[')) {
			if (line.startsWith('[remote')) {
				open = true;
				sections.push([line]);
			} else {
				open = false;
			}
		} else if (open) {
			(sections[sections.length - 1] as string[]).push(line);
		}
	}

	return sections.map((s) => {
		const url = s.find((l) => l.trimStart().startsWith('url = '));

		return {
			remote: (s[0] as string).replace('[remote "', '').replace('"]', ''),
			url: url ? url.replace('url = ', '').trim() : null,
		};
	});
};

export const getGitConfig = (remotionRoot: string) => {
	const gitFolder = BundlerInternals.findClosestFolderWithItem(
		remotionRoot,
		'.git',
	);
	if (!gitFolder) {
		return null;
	}

	const gitConfig = path.join(gitFolder, '.git', 'config');
	if (!existsSync(gitConfig)) {
		return null;
	}

	return gitConfig;
};

export const getGitRemoteOrigin = (gitConfig: string) => {
	const contents = readFileSync(gitConfig, 'utf-8');
	const lines = contents.split('\n');

	const remotes = getGitRemotes(lines);
	const origin = remotes.find((r) => r.remote === 'origin');
	return origin ?? null;
};

export const normalizeGitRemoteUrl = (url: string): ParsedGitRemote | null => {
	if (url.startsWith('git@github.com')) {
		const matched = url.match(/git@github.com:(.*)\/(.*)\.git/);
		if (matched) {
			return {
				type: 'github',
				name: matched[2] as string,
				org: matched[1] as string,
			};
		}
	}

	const gitHubMatch = url.match(/https:\/\/github.com\/(.*)\/(.*)\.git/);
	if (gitHubMatch) {
		return {
			type: 'github',
			name: gitHubMatch[2] as string,
			org: gitHubMatch[1] as string,
		};
	}

	const gitHubMatchWithoutGit = url.match(/https:\/\/github.com\/(.*)\/(.*)/);
	if (gitHubMatchWithoutGit) {
		return {
			type: 'github',
			name: gitHubMatchWithoutGit[2] as string,
			org: gitHubMatchWithoutGit[1] as string,
		};
	}

	return null;
};

export const getGifRef = (logLevel: LogLevel): string | null => {
	try {
		const ret = execSync('git rev-parse --abbrev-ref HEAD', {
			stdio: ['ignore', 'pipe', 'ignore'],
		})
			.toString('utf-8')
			.trim();
		return ret;
	} catch (err) {
		Log.verbose({logLevel, indent: false}, 'Could not get git ref', err);
		return null;
	}
};

const getFromEnvVariables = (): GitSource | null => {
	const {
		VERCEL_GIT_PROVIDER,
		VERCEL_GIT_COMMIT_SHA,
		VERCEL_GIT_REPO_OWNER,
		VERCEL_GIT_REPO_SLUG,
	} = process.env;
	if (
		VERCEL_GIT_COMMIT_SHA &&
		VERCEL_GIT_REPO_OWNER &&
		VERCEL_GIT_REPO_SLUG &&
		VERCEL_GIT_PROVIDER === 'github'
	) {
		return {
			name: VERCEL_GIT_REPO_SLUG,
			org: VERCEL_GIT_REPO_OWNER,
			ref: VERCEL_GIT_COMMIT_SHA,
			type: 'github',
			relativeFromGitRoot: '',
		};
	}

	return null;
};

export const getGitSource = ({
	remotionRoot,
	disableGitSource,
	logLevel,
}: {
	remotionRoot: string;
	disableGitSource: boolean;
	logLevel: LogLevel;
}): GitSource | null => {
	if (disableGitSource) {
		return null;
	}

	const fromEnv = getFromEnvVariables();
	if (fromEnv) {
		return getFromEnvVariables();
	}

	const ref = getGifRef(logLevel);
	if (!ref) {
		return null;
	}

	const gitConfig = getGitConfig(remotionRoot);
	if (!gitConfig) {
		return null;
	}

	const origin = getGitRemoteOrigin(gitConfig);
	if (!origin || !origin.url) {
		return null;
	}

	const parsed = normalizeGitRemoteUrl(origin.url);
	if (!parsed) {
		return null;
	}

	const gitRoot = path.dirname(path.dirname(gitConfig));
	const relativeFromGitRoot = path.relative(gitRoot, remotionRoot);

	return {
		name: parsed.name,
		org: parsed.org,
		ref,
		type: 'github',
		relativeFromGitRoot,
	};
};
