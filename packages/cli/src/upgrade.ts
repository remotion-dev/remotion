import {execSync, spawn} from 'node:child_process';
import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {
	findVersionSpecifier,
	findWorkspaceRoot,
	getCatalogEntries,
	isCatalogProtocol,
	updateCatalogEntry,
} from './catalog-utils';
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

type DepsWithVersions = {
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	optionalDependencies: Record<string, string>;
	peerDependencies: Record<string, string>;
};

export const getPackagesToUpgrade = ({
	depsWithVersions,
	catalogEntries,
	targetVersion,
	extraPackageVersions,
}: {
	depsWithVersions: DepsWithVersions;
	catalogEntries: Record<string, string>;
	targetVersion: string;
	extraPackageVersions: Record<string, string>;
}) => {
	const allDeps = [
		...Object.keys(depsWithVersions.dependencies),
		...Object.keys(depsWithVersions.devDependencies),
		...Object.keys(depsWithVersions.optionalDependencies),
		...Object.keys(depsWithVersions.peerDependencies),
	];
	const catalogPackages = new Set(Object.keys(catalogEntries));

	const remotionToUpgrade = listOfRemotionPackages.filter(
		(u) => allDeps.includes(u) || catalogPackages.has(u),
	);

	const installedExtraPackages = Object.keys(EXTRA_PACKAGES).filter(
		(pkg) => allDeps.includes(pkg) || catalogPackages.has(pkg),
	);

	const allPackagesToUpgrade = [
		...remotionToUpgrade,
		...installedExtraPackages,
	];

	const normalPackages: {pkg: string; version: string}[] = [];
	const catalogPackagesToUpgrade: {pkg: string; version: string}[] = [];

	for (const pkg of allPackagesToUpgrade) {
		const versionSpec = findVersionSpecifier(depsWithVersions, pkg);
		const targetVersionForPkg = extraPackageVersions[pkg] ?? targetVersion;

		if (
			(versionSpec && isCatalogProtocol(versionSpec)) ||
			(!versionSpec && catalogPackages.has(pkg))
		) {
			catalogPackagesToUpgrade.push({pkg, version: targetVersionForPkg});
		} else {
			normalPackages.push({pkg, version: targetVersionForPkg});
		}
	}

	return {normalPackages, catalogPackages: catalogPackagesToUpgrade};
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
	const depsWithVersions =
		StudioServerInternals.getInstalledDependenciesWithVersions(remotionRoot);

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

	const manager = StudioServerInternals.getPackageManager({
		remotionRoot,
		packageManager,
		dirUp: 0,
		logLevel,
	});

	if (manager === 'unknown') {
		throw new Error(
			`No lockfile was found in your project (one of ${StudioServerInternals.lockFilePaths
				.map((p) => p.path)
				.join(', ')}). Install dependencies using your favorite manager!`,
		);
	}

	const extraPackageVersions =
		getExtraPackageVersionsForRemotionVersion(targetVersion);
	const workspaceRoot = findWorkspaceRoot(remotionRoot);
	const catalogEntries = workspaceRoot ? getCatalogEntries(workspaceRoot) : {};

	const {normalPackages, catalogPackages} = getPackagesToUpgrade({
		depsWithVersions,
		catalogEntries,
		targetVersion,
		extraPackageVersions,
	});

	if (
		normalPackages.some(({pkg}) => pkg in EXTRA_PACKAGES) ||
		catalogPackages.some(({pkg}) => pkg in EXTRA_PACKAGES)
	) {
		const installedExtraPackages = [
			...normalPackages,
			...catalogPackages,
		].filter(({pkg}) => pkg in EXTRA_PACKAGES);
		Log.info(
			{indent: false, logLevel},
			`Also upgrading extra packages: ${installedExtraPackages.map(({pkg}) => `${pkg}@${extraPackageVersions[pkg]}`).join(', ')}`,
		);
	}

	if (catalogPackages.length > 0) {
		if (workspaceRoot) {
			const updatedCatalogEntries: string[] = [];

			for (const {pkg, version: pkgVersion} of catalogPackages) {
				const didUpdate = updateCatalogEntry({
					workspaceRoot,
					pkg,
					newVersion: pkgVersion,
				});
				if (didUpdate) {
					updatedCatalogEntries.push(`${pkg}@${pkgVersion}`);
				} else {
					normalPackages.push({pkg, version: pkgVersion});
				}
			}

			if (updatedCatalogEntries.length > 0) {
				Log.info(
					{indent: false, logLevel},
					chalk.green(
						`Updated catalog entries: ${updatedCatalogEntries.join(', ')}`,
					),
				);
			}
		} else {
			for (const catalogPkg of catalogPackages) {
				normalPackages.push(catalogPkg);
			}
		}
	}

	const packagesWithVersions = normalPackages.map(
		({pkg, version: pkgVersion}) => `${pkg}@${pkgVersion}`,
	);

	if (packagesWithVersions.length > 0) {
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

		await runPackageManagerCommand({
			manager: manager.manager,
			command,
			logLevel,
		});
	}

	if (catalogPackages.length > 0 && packagesWithVersions.length === 0) {
		Log.info(
			{indent: false, logLevel},
			chalk.gray(`$ ${manager.manager} install`),
		);

		await runPackageManagerCommand({
			manager: manager.manager,
			command: ['install'],
			logLevel,
		});
	}

	Log.info({indent: false, logLevel}, '⏫ Remotion has been upgraded!');
	Log.info({indent: false, logLevel}, 'https://remotion.dev/changelog');
};

const runPackageManagerCommand = async ({
	manager,
	command,
	logLevel,
}: {
	manager: string;
	command: string[];
	logLevel: LogLevel;
}) => {
	const task = spawn(manager, command, {
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
};
