import fs from 'fs';
import path from 'path';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

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
		startCommand: 'npm start',
	},
	{
		path: 'yarn.lock',
		manager: 'yarn',
		installCommand: 'yarn add',
		startCommand: 'yarn start',
	},
	{
		path: 'pnpm-lock.yaml',
		manager: 'pnpm',
		installCommand: 'pnpm i',
		startCommand: 'pnpm start',
	},
];

export const getPackageManager = (
	remotionRoot: string
): LockfilePath | 'unknown' => {
	const existingPkgManagers = lockFilePaths.filter((p) =>
		fs.existsSync(path.join(remotionRoot, p.path))
	);

	if (existingPkgManagers.length === 0) {
		return 'unknown';
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
