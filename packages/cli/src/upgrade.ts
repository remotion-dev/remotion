import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {execSync, spawn} from 'node:child_process';
import {chalk} from './chalk';
import {EXTRA_PACKAGES} from './extra-packages';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';

const getExtraPackageVersionsForRemotionVersion = (
	remotionVersion: string,
): Record<string, string> => {
	try {
		const output = execSync(
			`npm view @remotion/studio@${remotionVersion} dependencies --json`,
			{encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']},
		);
		const dependencies = JSON.parse(output) as Record<string, string>;

		const extraVersions: Record<string, string> = {};
		for (const pkg of Object.keys(EXTRA_PACKAGES)) {
			if (dependencies[pkg]) {
				extraVersions[pkg] = dependencies[pkg];
			}
		}

		return extraVersions;
	} catch {
		// If we can't fetch the versions, return the default versions from EXTRA_PACKAGES
		return EXTRA_PACKAGES;
	}
};

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

	const allDeps = [
		...dependencies,
		...devDependencies,
		...optionalDependencies,
		...peerDependencies,
	];

	const remotionToUpgrade = listOfRemotionPackages.filter((u) =>
		allDeps.includes(u),
	);

	// Check if extra packages (zod, mediabunny) are installed
	const installedExtraPackages = Object.keys(EXTRA_PACKAGES).filter((pkg) =>
		allDeps.includes(pkg),
	);

	// Get the correct versions for extra packages for this Remotion version
	const extraPackageVersions =
		getExtraPackageVersionsForRemotionVersion(targetVersion);

	// Build the list of packages to upgrade
	const packagesWithVersions = [
		...remotionToUpgrade.map((pkg) => `${pkg}@${targetVersion}`),
		...installedExtraPackages.map(
			(pkg) => `${pkg}@${extraPackageVersions[pkg]}`,
		),
	];

	if (installedExtraPackages.length > 0) {
		Log.info(
			{indent: false, logLevel},
			`Also upgrading extra packages: ${installedExtraPackages.map((pkg) => `${pkg}@${extraPackageVersions[pkg]}`).join(', ')}`,
		);
	}

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
