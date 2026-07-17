import type {SpawnOptions} from 'node:child_process';

const WINDOWS_CMD_MANAGERS = new Set(['npm', 'npx', 'yarn', 'pnpm']);

/**
 * On Windows, npm/npx/yarn/pnpm resolve to .cmd shims. Node 20+ rejects
 * shell:false spawn of those shims (ENOENT for the bare name, EINVAL for
 * `.cmd`). Use shell + windowsHide so Studio/CLI package manager calls work.
 * bun is a real .exe and only needs windowsHide.
 */
export const getPackageManagerSpawnOptions = (
	manager: string,
	platform: NodeJS.Platform = process.platform,
): SpawnOptions => {
	if (platform !== 'win32') {
		return {};
	}

	if (WINDOWS_CMD_MANAGERS.has(manager)) {
		return {shell: true, windowsHide: true};
	}

	return {windowsHide: true};
};
