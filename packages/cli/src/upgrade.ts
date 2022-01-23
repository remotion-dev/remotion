import {BundlerInternals, PackageManager} from '@remotion/bundler';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {Internals} from 'remotion';
import {Log} from './log';

const getUpgradeCommand = ({
	manager,
	packages,
	version,
}: {
	manager: PackageManager;
	packages: string[];
	version: string;
}): string[] => {
	const pkgList = packages.map((p) => `${p}@^${version}`);

	const commands: {[key in PackageManager]: string[]} = {
		npm: ['i', ...pkgList],
		pnpm: ['i', ...pkgList],
		yarn: ['add', ...pkgList],
	};

	return commands[manager];
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

	const manager = BundlerInternals.getPackageManager();

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
		}),
		{
			stdio: 'inherit',
		}
	);
	if (
		Internals.Logging.isEqualOrBelowLogLevel(
			Internals.Logging.getLogLevel(),
			'info'
		)
	) {
		prom.stdout?.pipe(process.stdout);
	}

	await prom;
	Log.info('⏫ Remotion has been upgraded!');
};
