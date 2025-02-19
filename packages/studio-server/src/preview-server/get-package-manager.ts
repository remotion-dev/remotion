import type {PackageManager} from '@remotion/studio-shared';
import fs from 'node:fs';
import path from 'node:path';

type LockfilePath = {
	manager: PackageManager;
	path: string;
	installCommand: string;
	startCommand: string;
};

export const lockFilePaths: LockfilePath[] = [
	{
		path: 'package-lock.json',
		manager: 'npm',
		installCommand: 'npm i',
		startCommand: 'npx remotion studio',
	},
	{
		path: 'yarn.lock',
		manager: 'yarn',
		installCommand: 'yarn add',
		startCommand: 'yarn remotion studio',
	},
	{
		path: 'pnpm-lock.yaml',
		manager: 'pnpm',
		installCommand: 'pnpm i',
		startCommand: 'pnpm exec remotion studio',
	},
	{
		path: 'bun.lock',
		manager: 'bun',
		installCommand: 'bun i',
		startCommand: 'bunx remotion studio',
	},
	{
		path: 'bun.lockb',
		manager: 'bun',
		installCommand: 'bun i',
		startCommand: 'bunx remotion studio',
	},
];

export const getPackageManager = (
	remotionRoot: string,
	packageManager: string | undefined,
	dirUp: number,
): LockfilePath | 'unknown' => {
	if (packageManager) {
		const manager = lockFilePaths.find((p) => p.manager === packageManager);

		if (!manager) {
			throw new Error(
				`The package manager ${packageManager} is not supported. Supported package managers are ${lockFilePaths
					.map((p) => p.manager)
					.join(', ')}`,
			);
		}

		return manager;
	}

	const existingPkgManagers = lockFilePaths.filter((p) =>
		fs.existsSync(
			path.join(remotionRoot, ...new Array(dirUp).fill('..'), p.path),
		),
	);

	if (existingPkgManagers.length === 0 && dirUp >= 2) {
		return 'unknown';
	}

	if (existingPkgManagers.length === 0) {
		return getPackageManager(remotionRoot, packageManager, dirUp + 1);
	}

	if (existingPkgManagers.length > 1) {
		const error = [
			`Found multiple lockfiles:`,
			...existingPkgManagers.map((m) => {
				return `- ${m.path}`;
			}),
			'',
			'This can lead to bugs, delete all but one of these files and run this command again.',
		].join('\n');

		throw new Error(error);
	}

	return existingPkgManagers[0];
};
