import path from 'path';
import fs from 'fs';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

type LockfilePath = {
	manager: PackageManager;
	path: string;
};
export const lockFilePaths: LockfilePath[] = [
	{path: 'package-lock.json', manager: 'npm'},
	{
		path: 'yarn.lock',
		manager: 'yarn',
	},
	{
		path: 'pnpm-lock.yaml',
		manager: 'pnpm',
	},
];

const discoverPkgManager = (currentPath: string): PackageManager | "unknown" => {
	if (currentPath === "/") {
		return "unknown";
	}

	const existingPkgManagers = lockFilePaths.filter((p) =>
		fs.existsSync(path.join(process.cwd(), p.path))
	);

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

	if (existingPkgManagers.length === 1) {
		return existingPkgManagers[0].manager;
	}

	return discoverPkgManager(path.dirname(currentPath));
}

export const getPackageManager = (): PackageManager | 'unknown' => {
	return discoverPkgManager(process.cwd());
};
