import {spawn} from 'node:child_process';
import {RenderInternals} from '@remotion/renderer';
import {
	extraPackages,
	isValidPackageName,
	type InstallPackageRequest,
	type InstallPackageResponse,
	type PackageInstallSpec,
} from '@remotion/studio-shared';
import {VERSION} from 'remotion/version';
import {getInstallCommand} from '../../helpers/install-command';
import {getPackageManagerSpawnOptions} from '../../helpers/package-manager-spawn-options';
import type {ApiHandler} from '../api-types';
import {getPackageManager, lockFilePaths} from '../get-package-manager';

const getExtraPackageVersion = (packageName: string): string | null => {
	const pkg = extraPackages.find((p) => p.name === packageName);
	return pkg ? pkg.version : null;
};

export const getPackageInstallSpec = (
	dependency: PackageInstallSpec,
): string => {
	const {name, version} = dependency;
	if (name === 'remotion' || name.startsWith('@remotion/'))
		return `${name}@${VERSION}`;
	if (version !== null) return `${name}@${version}`;
	const extraVersion = getExtraPackageVersion(name);
	return extraVersion === null ? name : `${name}@${extraVersion}`;
};

export const handleInstallPackage: ApiHandler<
	InstallPackageRequest,
	InstallPackageResponse
> = async ({logLevel, remotionRoot, input: {dependencies}}) => {
	for (const dependency of dependencies) {
		if (!isValidPackageName(dependency.name)) {
			return Promise.reject(
				new Error(
					`Package name ${JSON.stringify(dependency.name)} is invalid.`,
				),
			);
		}

		if (
			dependency.version !== null &&
			!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
				dependency.version,
			)
		) {
			return Promise.reject(
				new Error(
					`Package version ${JSON.stringify(dependency.version)} is invalid.`,
				),
			);
		}
	}

	const manager = getPackageManager({
		remotionRoot,
		packageManager: undefined,
		dirUp: 0,
		logLevel,
	});
	if (manager === 'unknown') {
		throw new Error(
			`No lockfile was found in your project (one of ${lockFilePaths.map((p) => p.path).join(', ')}). Install dependencies using your favorite manager!`,
		);
	}

	const packagesWithVersions = dependencies.map(getPackageInstallSpec);
	const command = getInstallCommand({
		manager: manager.manager,
		packages: packagesWithVersions,
		version: '',
		additionalArgs: [],
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		RenderInternals.chalk.gray(`╭─  ${manager.manager} ${command.join(' ')}`),
	);
	const time = Date.now();
	try {
		await new Promise<void>((resolve, reject) => {
			const cmd = spawn(
				manager.manager,
				command,
				getPackageManagerSpawnOptions(),
			);
			cmd.on('error', reject);
			cmd.stdout.on('data', (d: Buffer) =>
				d
					.toString()
					.trim()
					.split('\n')
					.forEach((line) =>
						RenderInternals.Log.info({indent: true, logLevel}, line),
					),
			);
			cmd.stdout.on('end', resolve);
			cmd.on('close', (code, signal) =>
				code === 0
					? resolve()
					: reject(
							new Error(
								`Command exited with code ${code} and signal ${signal}`,
							),
						),
			);
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray('╰─ '),
			`Done in ${Date.now() - time}ms`,
		);
		return {};
	} catch (err) {
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray('╰─ '),
			RenderInternals.chalk.red(`Errored in ${Date.now() - time}ms`),
		);
		return Promise.reject(err);
	}
};
