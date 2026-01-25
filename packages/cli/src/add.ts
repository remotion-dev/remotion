import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {spawn} from 'node:child_process';
import {chalk} from './chalk';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
const EXTRA_PACKAGES: Record<string, string> = {
	zod: '3.22.2',
	mediabunny: '1.29.0',
};

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
		(pkg) => !listOfRemotionPackages.includes(pkg) && !EXTRA_PACKAGES[pkg],
	);
	if (invalidPackages.length > 0) {
		throw new Error(
			`The following packages are not Remotion packages: ${invalidPackages.join(', ')}. Must be one of the Remotion packages or one of the supported extra packages: ${Object.keys(EXTRA_PACKAGES).join(', ')}.`,
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

	const installedRemotionPackages = listOfRemotionPackages.filter((pkg) =>
		allDeps.includes(pkg),
	);

	// Get the version from the first installed Remotion package
	const packageJsonPath = `${remotionRoot}/node_modules/${installedRemotionPackages[0]}/package.json`;
	let targetVersion: string | null = null;

	if (installedRemotionPackages.length > 0) {
		try {
			const packageJson = require(packageJsonPath);
			targetVersion = packageJson.version;
			const packageList =
				toInstall.length === 1
					? toInstall[0]
					: `${toInstall.length} packages (${toInstall.join(', ')})`;
			Log.info(
				{indent: false, logLevel},
				`Installing ${packageList} to match your other Remotion packages (zod and mediabunny exception)`,
			);
		} catch (err) {
			throw new Error(
				`Could not determine version of installed Remotion packages: ${(err as Error).message}`,
			);
		}
	} else {
		// If no Remotion packages are installed, we can only install extra packages
		const notExtraPackages = toInstall.filter((pkg) => !EXTRA_PACKAGES[pkg]);
		if (notExtraPackages.length > 0) {
			throw new Error(
				'No Remotion packages found in your project. Install Remotion first.',
			);
		}
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

	const packagesWithVersions = toInstall.map((pkg) => {
		if (EXTRA_PACKAGES[pkg]) {
			return `${pkg}@${EXTRA_PACKAGES[pkg]}`;
		}
		return `${pkg}@${targetVersion}`;
	});

	const command = StudioServerInternals.getInstallCommand({
		manager: manager.manager,
		packages: packagesWithVersions,
		version: '',
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
		if (EXTRA_PACKAGES[pkg]) {
			Log.info({indent: false, logLevel}, `+ ${pkg}@${EXTRA_PACKAGES[pkg]}`);
		} else {
			Log.info({indent: false, logLevel}, `+ ${pkg}@${targetVersion}`);
		}
	}
};
