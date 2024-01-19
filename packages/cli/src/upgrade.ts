import {RenderInternals} from '@remotion/renderer';
import type {PackageManager} from '@remotion/studio-server';
import {StudioInternals} from '@remotion/studio-server';
import path from 'node:path';
import {ConfigInternals} from './config';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';

const getUpgradeCommand = ({
	manager,
	packages,
	version,
}: {
	manager: PackageManager;
	packages: string[];
	version: string;
}): string[] => {
	const pkgList = packages.map((p) => `${p}@${version}`);
	const commands: {[key in PackageManager]: string[]} = {
		npm: ['i', '--save-exact', ...pkgList],
		pnpm: ['i', '--save-exact', ...pkgList],
		yarn: ['add', '--exact', ...pkgList],
		bun: ['i', ...pkgList],
	};

	return commands[manager];
};

export const upgrade = async (
	remotionRoot: string,
	packageManager: string | undefined,
	version: string | undefined,
) => {
	const packageJsonFilePath = path.join(remotionRoot, 'package.json');
	const packageJson = require(packageJsonFilePath);
	const dependencies = Object.keys(packageJson.dependencies);
	const devDependencies = Object.keys(packageJson.devDependencies ?? {});
	const optionalDependencies = Object.keys(
		packageJson.optionalDependencies ?? {},
	);
	const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

	let targetVersion: string;
	if (version) {
		targetVersion = version;
		Log.info('Upgrading to specified version: ' + version);
	} else {
		targetVersion = await StudioInternals.getLatestRemotionVersion();
		Log.info('Newest Remotion version is', targetVersion);
	}

	const manager = StudioInternals.getPackageManager(
		remotionRoot,
		packageManager,
	);

	if (manager === 'unknown') {
		throw new Error(
			`No lockfile was found in your project (one of ${StudioInternals.lockFilePaths
				.map((p) => p.path)
				.join(', ')}). Install dependencies using your favorite manager!`,
		);
	}

	const toUpgrade = listOfRemotionPackages.filter(
		(u) =>
			dependencies.includes(u) ||
			devDependencies.includes(u) ||
			optionalDependencies.includes(u) ||
			peerDependencies.includes(u),
	);

	const prom = RenderInternals.execa(
		manager.manager,
		getUpgradeCommand({
			manager: manager.manager,
			packages: toUpgrade,
			version: targetVersion,
		}),
		{
			stdio: 'inherit',
		},
	);
	if (
		RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'info',
		)
	) {
		prom.stdout?.pipe(process.stdout);
	}

	await prom;
	Log.info('⏫ Remotion has been upgraded!');
	Log.info('https://remotion.dev/changelog');
};
