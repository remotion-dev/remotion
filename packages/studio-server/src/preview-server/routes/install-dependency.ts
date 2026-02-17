import {RenderInternals} from '@remotion/renderer';
import {
	extraPackages,
	type InstallPackageRequest,
	type InstallPackageResponse,
} from '@remotion/studio-shared';
import {spawn} from 'node:child_process';
import {VERSION} from 'remotion/version';
import {getInstallCommand} from '../../helpers/install-command';
import type {ApiHandler} from '../api-types';
import {getPackageManager, lockFilePaths} from '../get-package-manager';

const extraPackageNames = extraPackages.map((pkg) => pkg.name);

const isExtraPackage = (packageName: string): boolean => {
	return extraPackageNames.includes(packageName);
};

const getExtraPackageVersion = (packageName: string): string | null => {
	const pkg = extraPackages.find((p) => p.name === packageName);
	return pkg ? pkg.version : null;
};

export const handleInstallPackage: ApiHandler<
	InstallPackageRequest,
	InstallPackageResponse
> = async ({logLevel, remotionRoot, input: {packageNames}}) => {
	for (const packageName of packageNames) {
		if (!packageName.startsWith('@remotion/') && !isExtraPackage(packageName)) {
			return Promise.reject(
				new Error(`Package ${packageName} is not allowed to be installed.`),
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
			`No lockfile was found in your project (one of ${lockFilePaths
				.map((p) => p.path)
				.join(', ')}). Install dependencies using your favorite manager!`,
		);
	}

	// Build packages with appropriate versions
	const packagesWithVersions = packageNames.map((pkg) => {
		const extraVersion = getExtraPackageVersion(pkg);
		if (extraVersion) {
			return `${pkg}@${extraVersion}`;
		}

		return `${pkg}@${VERSION}`;
	});

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
			const cmd = spawn(manager.manager, command, {});
			cmd.stdout.on('data', (d: Buffer) => {
				const splitted = d.toString().trim().split('\n');
				splitted.forEach((line) => {
					RenderInternals.Log.info({indent: true, logLevel}, line);
				});
			});
			cmd.stdout.on('end', () => {
				resolve();
			});
			cmd.on('close', (code, signal) => {
				if (code === 0) {
					resolve();
				} else {
					reject(
						new Error(`Command exited with code ${code} and signal ${signal}`),
					);
				}
			});
		});
		const timeEnd = Date.now();

		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray('╰─ '),
			`Done in ${timeEnd - time}ms`,
		);
		return Promise.resolve({});
	} catch (err) {
		const timeEnd = Date.now();
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray('╰─ '),
			RenderInternals.chalk.red(`Errored in ${timeEnd - time}ms`),
		);
		return Promise.reject(err);
	}
};
