import {exec} from 'node:child_process';
import path from 'node:path';
import {Log} from './log';
import type {Template} from './templates';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const shouldUseBun = (): boolean => {
	if (
		process.env._?.endsWith('/bin/bun') ||
		process.env._?.endsWith('/bin/bunx')
	) {
		return true;
	}

	return false;
};

const shouldUseYarn = (): boolean => {
	return Boolean(
		process.env.npm_execpath?.includes('yarn.js') ||
			process.env.npm_config_user_agent?.includes('yarn'),
	);
};

const shouldUsePnpm = (): boolean => {
	if (__dirname.includes(path.join('.pnpm', 'create-video'))) {
		return true;
	}

	if (!process.env.npm_config_argv) {
		return false;
	}

	try {
		const conf = JSON.parse(process.env.npm_config_argv);
		return conf.remain[0] === 'dlx';
	} catch {
		return false;
	}
};

export const selectPackageManager = (): PackageManager => {
	if (shouldUseYarn()) {
		return 'yarn';
	}

	if (shouldUsePnpm()) {
		return 'pnpm';
	}

	if (shouldUseBun()) {
		return 'bun';
	}

	return 'npm';
};

export const getInstallCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm i`;
	}

	if (manager === 'yarn') {
		return `yarn`;
	}

	if (manager === 'pnpm') {
		return `pnpm i`;
	}

	if (manager === 'bun') {
		return `bun install`;
	}
};

const getStartCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm run dev`;
	}

	if (manager === 'yarn') {
		return `yarn dev`;
	}

	if (manager === 'pnpm') {
		return `pnpm run dev`;
	}

	if (manager === 'bun') {
		return `bun run dev`;
	}
};

export const getRunCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm run`;
	}

	if (manager === 'yarn') {
		return `yarn run`;
	}

	if (manager === 'pnpm') {
		return `pnpm run`;
	}

	if (manager === 'bun') {
		return `bun run`;
	}

	throw new TypeError('unknown package manager');
};

export const getRenderCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npx remotion render`;
	}

	if (manager === 'yarn') {
		return `yarn remotion render`;
	}

	if (manager === 'pnpm') {
		return `pnpm exec remotion render`;
	}

	if (manager === 'bun') {
		return `bunx remotion render`;
	}

	throw new TypeError('unknown package manager');
};

export const getUpgradeCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npx remotion upgrade`;
	}

	if (manager === 'yarn') {
		return `yarn remotion upgrade`;
	}

	if (manager === 'pnpm') {
		return `pnpm exec remotion upgrade`;
	}

	if (manager === 'bun') {
		return `bunx remotion upgrade`;
	}

	throw new TypeError('unknown package manager');
};

export const getDevCommand = (manager: PackageManager, template: Template) => {
	if (
		template.cliId === 'react-router' ||
		template.cliId === 'next' ||
		template.cliId === 'next-tailwind' ||
		template.cliId === 'next-pages-dir'
	) {
		return `${getRunCommand(manager)} dev`;
	}

	return getStartCommand(manager);
};

export const getPackageManagerVersion = (
	manager: PackageManager,
): Promise<string> => {
	const cmd: `${PackageManager} -v` = `${manager} -v`;

	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}

			if (stderr) {
				reject(stderr);
				return;
			}

			resolve(stdout.trim());
		});
	});
};

export const getPackageManagerVersionOrNull = async (
	manager: PackageManager,
): Promise<string | null> => {
	try {
		const version = await getPackageManagerVersion(manager);
		return version;
	} catch {
		Log.warn(`Could not determine the version of ${manager}.`);
		return null;
	}
};
