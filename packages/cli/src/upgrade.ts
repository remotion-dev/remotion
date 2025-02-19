import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {spawn} from 'node:child_process';
import {chalk} from './chalk';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';

export const upgradeCommand = async ({
	remotionRoot,
	packageManager,
	version,
	logLevel,
	args,
}: {
	remotionRoot: string;
	packageManager: string | undefined;
	version: string | undefined;
	logLevel: LogLevel;
	args: string[];
}) => {
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
		0,
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

	const command = StudioServerInternals.getInstallCommand({
		manager: manager.manager,
		packages: toUpgrade,
		version: targetVersion,
		additionalArgs: args,
	});

	Log.info(
		{indent: false, logLevel},
		chalk.gray(`$ ${manager.manager} ${command.join(' ')}`),
	);

	const task = spawn(manager.manager, command, {
		env: {
			...process.env,
			ADBLOCK: '1',
			DISABLE_OPENCOLLECTIVE: '1',
		},
		stdio: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'info')
			? 'inherit'
			: 'ignore',
	});

	await new Promise<void>((resolve) => {
		task.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else if (RenderInternals.isEqualOrBelowLogLevel(logLevel, 'info')) {
				throw new Error('Failed to upgrade Remotion, see logs above');
			} else {
				throw new Error(
					'Failed to upgrade Remotion, run with --log=info info to see logs',
				);
			}
		});
	});

	Log.info({indent: false, logLevel}, '⏫ Remotion has been upgraded!');
	Log.info({indent: false, logLevel}, 'https://remotion.dev/changelog');
};
