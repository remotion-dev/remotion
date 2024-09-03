import {RenderInternals, type LogLevel} from '@remotion/renderer';
import type {PackageManager} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {spawn} from 'node:child_process';
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
		npm: ['i', '--save-exact', '--no-fund', '--no-audit', ...pkgList],
		pnpm: ['i', ...pkgList],
		yarn: ['add', '--exact', ...pkgList],
		bun: ['i', ...pkgList],
	};

	return commands[manager];
};

export const upgrade = async (
	remotionRoot: string,
	packageManager: string | undefined,
	version: string | undefined,
	logLevel: LogLevel,
) => {
	const {
		dependencies,
		devDependencies,
		optionalDependencies,
		peerDependencies,
	} = StudioServerInternals.getInstalledDependencies(remotionRoot);

	let targetVersion: string;
	if (version) {
		targetVersion = version;
		Log.info(
			{indent: false, logLevel},
			'Upgrading to specified version: ' + version,
		);
	} else {
		targetVersion = await StudioServerInternals.getLatestRemotionVersion();
		Log.info(
			{indent: false, logLevel},
			'Newest Remotion version is',
			targetVersion,
		);
	}

	const manager = StudioServerInternals.getPackageManager(
		remotionRoot,
		packageManager,
	);

	if (manager === 'unknown') {
		throw new Error(
			`No lockfile was found in your project (one of ${StudioServerInternals.lockFilePaths
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

	const task = spawn(
		manager.manager,
		getUpgradeCommand({
			manager: manager.manager,
			packages: toUpgrade,
			version: targetVersion,
		}),
		{
			env: {
				...process.env,
				ADBLOCK: '1',
				DISABLE_OPENCOLLECTIVE: '1',
			},
			stdio: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'info')
				? 'inherit'
				: 'ignore',
		},
	);

	await new Promise<void>((resolve) => {
		task.on('close', resolve);
	});

	Log.info({indent: false, logLevel}, '⏫ Remotion has been upgraded!');
	Log.info({indent: false, logLevel}, 'https://remotion.dev/changelog');
};
