import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import {ConfigInternals} from './config';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';
import {resolveFrom} from './resolve-from';

const packages = [
	'@remotion/bundler',
	'@remotion/cli',
	'@remotion/eslint-config',
	'@remotion/renderer',
	'@remotion/skia',
	'@remotion/lottie',
	'@remotion/media-utils',
	'@remotion/paths',
	'@remotion/babel-loader',
	'@remotion/lambda',
	'@remotion/preload',
	'@remotion/player',
	'@remotion/three',
	'@remotion/gif',
	'remotion',
];

const getVersion = async (
	remotionRoot: string,
	p: string
): Promise<string | null> => {
	try {
		const remotionPkgJson = resolveFrom(remotionRoot, `${p}/package.json`);
		const file = await fs.promises.readFile(remotionPkgJson, 'utf-8');
		const packageJson = JSON.parse(file);
		return packageJson.version;
	} catch (err) {
		return null;
	}
};

const groupBy = (vals: [string, string][]) => {
	const groups: {[key: string]: string[]} = {};
	for (const [pkg, version] of vals) {
		if (!groups[version]) {
			groups[version] = [];
		}

		groups[version].push(pkg);
	}

	return groups;
};

const getAllVersions = async (
	remotionRoot: string
): Promise<[string, string][]> => {
	return (
		await Promise.all(
			packages.map(
				async (p) => [p, await getVersion(remotionRoot, p)] as [string, string]
			)
		)
	).filter(([, version]) => version);
};

export const VERSIONS_COMMAND = 'versions';

export const validateVersionsBeforeCommand = async (remotionRoot: string) => {
	const versions = await getAllVersions(remotionRoot);

	const grouped = groupBy(versions);

	const installedVersions = Object.keys(grouped);

	if (installedVersions.length === 1) {
		return;
	}

	Log.warn('-------------');
	Log.warn('Version mismatch:');
	for (const version of installedVersions) {
		Log.warn(`- On version: ${version}`);
		for (const pkg of grouped[version]) {
			Log.warn(`  - ${pkg}`);
		}

		Log.info();
	}

	Log.warn('You may experience breakages such as:');
	Log.warn('- React context and hooks not working');
	Log.warn('- Type errors and feature incompatibilities');
	Log.warn('- Failed renders and unclear errors');
	Log.warn();
	Log.warn('To resolve:');
	Log.warn(
		'- Make sure your package.json has all Remotion packages pointing to the same version.'
	);
	Log.warn(
		'- Remove the `^` character in front of a version to pin a package.'
	);
	if (
		!RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		)
	) {
		Log.warn(
			'- Run `npx remotion versions --log=verbose` to see the path of the modules resolved.'
		);
	}

	Log.warn('-------------');
	Log.info();
};

export const versionsCommand = async (remotionRoot: string) => {
	parseCommandLine('versions');
	const versions = await getAllVersions(remotionRoot);

	const grouped = groupBy(versions);

	const installedVersions = Object.keys(grouped);

	Log.info(`Node.JS = ${process.version}, OS = ${process.platform}`);
	Log.info();
	for (const version of installedVersions) {
		Log.info(`On version: ${version}`);
		for (const pkg of grouped[version]) {
			Log.info(`- ${pkg}`);
			Log.verbose(`  ${resolveFrom(remotionRoot, `${pkg}/package.json`)}`);
		}

		Log.info();
	}

	if (installedVersions.length === 1) {
		Log.info(`✅ Great! All packages have the same version.`);
	} else {
		Log.error(
			'Version mismatch: Not all Remotion packages have the same version.'
		);
		Log.info(
			'- Make sure your package.json has all Remotion packages pointing to the same version.'
		);
		Log.info(
			'- Remove the `^` character in front of a version to pin a package.'
		);
		if (
			!RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose'
			)
		) {
			Log.info(
				'- Rerun this command with --log=verbose to see the path of the modules resolved.'
			);
		}

		process.exit(1);
	}
};
