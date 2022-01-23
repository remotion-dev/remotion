import {BundlerInternals} from '@remotion/bundler';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {Internals} from 'remotion';
import {Log} from './log';

type Manager = 'npm' | 'yarn' | 'pnpm';

type LockfilePath = {
	manager: Manager;
	path: string;
};

const getPkgManager = (): Manager => {
	const paths: LockfilePath[] = [
		{path: path.join(process.cwd(), 'package-lock.json'), manager: 'npm'},
		{
			path: path.join(process.cwd(), 'yarn.lock'),
			manager: 'yarn',
		},
		{
			path: path.join(process.cwd(), 'pnpm-lock.yaml'),
			manager: 'pnpm',
		},
	];

	const existingPkgManagers = paths.filter((p) => fs.existsSync(p.path));

	if (existingPkgManagers.length === 0) {
		Log.error(
			`No lockfile was found in your project (one of ${existingPkgManagers
				.map((p) => p.manager)
				.join(', ')}). Install dependencies using your favorite manager!`
		);
		process.exit(1);
	}

	if (existingPkgManagers.length > 1) {
		Log.error(`Found multiple lockfiles:`);
		for (const pkgManager of existingPkgManagers) {
			Log.error(`- ${pkgManager.path}`);
		}

		Log.error();
		Log.error(
			'This can lead to bugs, delete all but one of these files and run this command again.'
		);
		process.exit(1);
	}

	return existingPkgManagers[0].manager;
};

const getUpgradeCommand = ({
	manager,
	packages,
	version,
}: {
	manager: Manager;
	packages: string[];
	version: string;
}): string[] => {
	const pkgList = packages.map((p) => `^${p}@${version}`).join(' ');
	if (manager === 'npm') {
		return ['i', ...pkgList];
	}

	if (manager === 'yarn') {
		return ['add', ...pkgList];
	}

	if (manager === 'pnpm') {
		return ['i', ...pkgList];
	}

	throw new Error('Invalid pkg manager ' + manager);
};

export const upgrade = async () => {
	const packageJsonFilePath = path.join(process.cwd(), 'package.json');
	if (!fs.existsSync(packageJsonFilePath)) {
		Log.error(
			'Could not upgrade because no package.json could be found in your project.'
		);
		process.exit(1);
	}

	const packageJson = require(packageJsonFilePath);
	const dependencies = Object.keys(packageJson.dependencies);
	const latestRemotionVersion =
		await BundlerInternals.getLatestRemotionVersion();

	const manager = getPkgManager();

	const toUpgrade = [
		'@remotion/bundler',
		'@remotion/cli',
		'@remotion/eslint-config',
		'@remotion/renderer',
		'@remotion/media-utils',
		'@remotion/babel-loader',
		'@remotion/lambda',
		'@remotion/three',
		'@remotion/gif',
		'remotion',
	].filter((u) => dependencies.includes(u));

	const prom = execa(
		manager,
		getUpgradeCommand({
			manager,
			packages: toUpgrade,
			version: latestRemotionVersion,
		})
	);
	if (Internals.Logging.isEqualOrBelowLogLevel('info')) {
		prom.stdout?.pipe(process.stdout);
	}

	await prom;
	Log.info('⏫ Remotion has been upgraded!');
};
