import type {PackageManager} from '@remotion/studio-shared';

export const getInstallCommand = ({
	manager,
	packages,
	version,
	additionalArgs,
}: {
	manager: PackageManager;
	packages: string[];
	version: string;
	additionalArgs: string[];
}): string[] => {
	const pkgList = packages.map((p) => `${p}@${version}`);

	const commands: {[key in PackageManager]: string[]} = {
		npm: [
			'i',
			'--save-exact',
			'--no-fund',
			'--no-audit',
			...additionalArgs,
			...pkgList,
		],
		pnpm: ['i', ...additionalArgs, ...pkgList],
		yarn: ['add', '--exact', ...additionalArgs, ...pkgList],
		bun: ['i', ...additionalArgs, ...pkgList],
	};

	return commands[manager];
};
