import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {spawn} from 'node:child_process';
import {chalk} from './chalk';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';

export const addCommand = async ({
	remotionRoot,
	packageManager,
	packageNames,
	logLevel,
	args,
}: {
	remotionRoot: string;
	packageManager: string | undefined;
	packageNames: string[];
	logLevel: LogLevel;
	args: string[];
}) => {
	// Validate that all package names are Remotion packages
	const invalidPackages = packageNames.filter(
		(pkg) => !listOfRemotionPackages.includes(pkg),
	);
	if (invalidPackages.length > 0) {
		throw new Error(
			`The following packages are not Remotion packages: ${invalidPackages.join(', ')}. Must be one of the Remotion packages.`,
		);
	}

	const {
		dependencies,
		devDependencies,
		optionalDependencies,
		peerDependencies,
	} = StudioServerInternals.getInstalledDependencies(remotionRoot);

	// Check if packages are already installed
	const allDeps = [
		...dependencies,
		...devDependencies,
		...optionalDependencies,
		...peerDependencies,
	];

	const alreadyInstalled = packageNames.filter((pkg) => allDeps.includes(pkg));
	const toInstall = packageNames.filter((pkg) => !allDeps.includes(pkg));

	// Log already installed packages
	for (const pkg of alreadyInstalled) {
		Log.info(
			{indent: false, logLevel},
			`○ ${pkg} ${chalk.gray('(already installed)')}`,
		);
	}

	// If nothing to install, return early
	if (toInstall.length === 0) {
		return;
	}

	// Find the version of installed Remotion packages
	const installedRemotionPackages = listOfRemotionPackages.filter((pkg) =>
		allDeps.includes(pkg),
	);

	if (installedRemotionPackages.length === 0) {
		throw new Error(
			'No Remotion packages found in your project. Install Remotion first.',
		);
	}

	// Get the version from the first installed Remotion package
	const packageJsonPath = `${remotionRoot}/node_modules/${installedRemotionPackages[0]}/package.json`;
	let targetVersion: string;

	try {
		const packageJson = require(packageJsonPath);
		targetVersion = packageJson.version;
		const packageList =
			toInstall.length === 1
				? toInstall[0]
				: `${toInstall.length} packages (${toInstall.join(', ')})`;
		Log.info(
			{indent: false, logLevel},
			`Installing ${packageList}@${targetVersion} to match your other Remotion packages`,
		);
	} catch (err) {
		throw new Error(
			`Could not determine version of installed Remotion packages: ${(err as Error).message}`,
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

	const command = StudioServerInternals.getInstallCommand({
		manager: manager.manager,
		packages: toInstall,
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
				throw new Error(`Failed to install packages, see logs above`);
			} else {
				throw new Error(
					`Failed to install packages, run with --log=info to see logs`,
				);
			}
		});
	});

	for (const pkg of alreadyInstalled) {
		Log.info(
			{indent: false, logLevel},
			`○ ${pkg}@${targetVersion} ${chalk.gray('(already installed)')}`,
		);
	}

	for (const pkg of toInstall) {
		Log.info({indent: false, logLevel}, `+ ${pkg}@${targetVersion}`);
	}
};
