import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {execSync, spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {chalk} from './chalk';
import {EXTRA_PACKAGES} from './extra-packages';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
import {
	findPnpmWorkspaceYaml,
	getCatalogPackagesFromWorkspaceYaml,
	getPackagesCatalogRefs,
	updateCatalogVersionInYaml,
} from './pnpm-catalog';

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

	// Build the full map of packages and their target versions
	const allPackageVersions: Record<string, string> = {};
	for (const pkg of remotionToUpgrade) {
		allPackageVersions[pkg] = targetVersion;
	}

	for (const pkg of installedExtraPackages) {
		const ver = extraPackageVersions[pkg];
		if (ver) {
			allPackageVersions[pkg] = ver;
		}
	}

	if (installedExtraPackages.length > 0) {
		Log.info(
			{indent: false, logLevel},
			`Also upgrading extra packages: ${installedExtraPackages.map((pkg) => `${pkg}@${extraPackageVersions[pkg]}`).join(', ')}`,
		);
	}

	// Handle pnpm catalog: check if any packages use catalog: entries
	let packagesForInstall = Object.entries(allPackageVersions).map(
		([pkg, ver]) => `${pkg}@${ver}`,
	);

	if (manager.manager === 'pnpm') {
		const workspaceYamlPath = findPnpmWorkspaceYaml(remotionRoot);
		if (workspaceYamlPath) {
			const catalogPackagesInWorkspace =
				getCatalogPackagesFromWorkspaceYaml(workspaceYamlPath);

			// Read the package.json to find which packages use catalog: entries
			const packageJsonPath = path.join(remotionRoot, 'package.json');
			const packageJson = JSON.parse(
				fs.readFileSync(packageJsonPath, 'utf-8'),
			) as Record<string, Record<string, string>>;

			// Find packages that reference catalog: in this package.json
			const catalogRefs = getPackagesCatalogRefs(
				packageJson,
				Object.keys(allPackageVersions),
			);

			// Also check workspace-level catalog for packages that are in the catalog
			// but might be referenced from workspace packages
			const catalogPackagesToUpdate: Array<{
				pkg: string;
				newVersion: string;
				catalogName: string;
			}> = [];

			for (const [pkg, ver] of Object.entries(allPackageVersions)) {
				const catalogRef = catalogRefs[pkg];
				if (catalogRef !== undefined) {
					// This package uses catalog: in the current package.json
					catalogPackagesToUpdate.push({
						pkg,
						newVersion: ver,
						catalogName: catalogRef,
					});
				} else if (catalogPackagesInWorkspace[pkg] !== undefined) {
					// This package is defined in the workspace catalog
					// (another workspace package may reference it via catalog:)
					catalogPackagesToUpdate.push({
						pkg,
						newVersion: ver,
						catalogName: catalogPackagesInWorkspace[pkg] as string,
					});
				}
			}

			if (catalogPackagesToUpdate.length > 0) {
				// Update pnpm-workspace.yaml for catalog packages
				let yamlContent = fs.readFileSync(workspaceYamlPath, 'utf-8');
				for (const {
					pkg,
					newVersion: catalogPkgVersion,
					catalogName,
				} of catalogPackagesToUpdate) {
					yamlContent = updateCatalogVersionInYaml(
						yamlContent,
						pkg,
						catalogPkgVersion,
						catalogName,
					);
				}

				fs.writeFileSync(workspaceYamlPath, yamlContent, 'utf-8');
				Log.info(
					{indent: false, logLevel},
					`Updated catalog versions in ${workspaceYamlPath}`,
				);

				// Remove catalog packages from the install command list
				const catalogPkgNames = new Set(
					catalogPackagesToUpdate.map(({pkg}) => pkg),
				);
				packagesForInstall = packagesForInstall.filter((p) => {
					const pkgName = p.substring(0, p.lastIndexOf('@'));
					return !catalogPkgNames.has(pkgName);
				});
			}
		}
	}

	const command = StudioServerInternals.getInstallCommand({
		manager: manager.manager,
		packages: packagesForInstall,
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
