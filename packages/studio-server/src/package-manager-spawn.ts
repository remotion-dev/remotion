import type {SpawnOptions} from 'node:child_process';

const WINDOWS_CMD_MANAGERS = new Set(['npm', 'yarn', 'pnpm']);

/**
 * On Windows, npm/yarn/pnpm resolve to .cmd shims. Node 20+ rejects
 * shell:false spawn of those shims (ENOENT for the bare name, EINVAL for
 * `.cmd`). Use shell + windowsHide so Studio can install packages.
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
