import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {spawn} from 'node:child_process';
import {chalk} from './chalk';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';

export const addCommand = async ({
	remotionRoot,
	packageManager,
	packageName,
	logLevel,
	args,
}: {
	remotionRoot: string;
	packageManager: string | undefined;
	packageName: string;
	logLevel: LogLevel;
	args: string[];
}) => {
	// Validate that the package name is a Remotion package
	if (!listOfRemotionPackages.includes(packageName)) {
		throw new Error(
			`Package "${packageName}" is not a Remotion package. Run "npx remotion versions" to see installed Remotion packages.`,
		);
	}

	const {
		dependencies,
		devDependencies,
		optionalDependencies,
		peerDependencies,
	} = StudioServerInternals.getInstalledDependencies(remotionRoot);

	// Check if the package is already installed
	const allDeps = [
		...dependencies,
		...devDependencies,
		...optionalDependencies,
		...peerDependencies,
	];

	if (allDeps.includes(packageName)) {
		Log.info(
			{indent: false, logLevel},
			chalk.yellow(`Package "${packageName}" is already installed.`),
		);
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
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const packageJson = require(packageJsonPath);
		targetVersion = packageJson.version;
		Log.info(
			{indent: false, logLevel},
			`Installing ${packageName}@${targetVersion} to match your other Remotion packages`,
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
		packages: [packageName],
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
				throw new Error(
					`Failed to install ${packageName}, see logs above`,
				);
			} else {
				throw new Error(
					`Failed to install ${packageName}, run with --log=info to see logs`,
				);
			}
		});
	});

	Log.info(
		{indent: false, logLevel},
		`✅ ${packageName} has been installed!`,
	);
};
