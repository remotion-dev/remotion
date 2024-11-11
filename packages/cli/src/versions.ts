import type {LogLevel, LogOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {chalk} from './chalk';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';
import {resolveFrom} from './resolve-from';

export type VersionAndPath = {version: string; path: string};

const getVersion = async (
	remotionRoot: string,
	p: string,
): Promise<VersionAndPath | null> => {
	try {
		const remotionPkgJson = resolveFrom(remotionRoot, `${p}/package.json`);
		const file = await fs.promises.readFile(remotionPkgJson, 'utf-8');
		const packageJson = JSON.parse(file);
		return {version: packageJson.version, path: remotionPkgJson};
	} catch {
		return null;
	}
};

type Val = {
	pkg: string;
	versionAndPath: VersionAndPath;
};

const groupBy = (vals: [string, VersionAndPath][]) => {
	const groups: {[key: string]: Val[]} = {};
	for (const [pkg, version] of vals) {
		if (!groups[version.version]) {
			groups[version.version] = [];
		}

		(groups[version.version] as Val[]).push({
			pkg,
			versionAndPath: version,
		});
	}

	return groups;
};

const getAllVersions = async (
	remotionRoot: string,
): Promise<[string, VersionAndPath][]> => {
	return (
		await Promise.all(
			listOfRemotionPackages.map(
				async (p) =>
					[p, await getVersion(remotionRoot, p)] as [string, VersionAndPath],
			),
		)
	).filter(([, version]) => version);
};

export const VERSIONS_COMMAND = 'versions';

export const validateVersionsBeforeCommand = async (
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const versions = await getAllVersions(remotionRoot);

	const grouped = groupBy(versions);

	const installedVersions = Object.keys(grouped);

	if (installedVersions.length === 1) {
		return;
	}

	// Could be a global install of @remotion/cli.
	// If you render a bundle with a different version, it will give a warning accordingly.
	if (installedVersions.length === 0) {
		return;
	}

	const logOptions: LogOptions = {indent: false, logLevel};
	Log.warn(logOptions, '-------------');
	Log.warn(logOptions, 'Version mismatch:');
	for (const version of installedVersions) {
		Log.warn(logOptions, `- On version: ${version}`);
		for (const pkg of grouped[version] ?? []) {
			Log.warn(
				logOptions,
				`  - ${pkg.pkg} ${chalk.gray(path.relative(remotionRoot, pkg.versionAndPath.path))}`,
			);
		}

		Log.info({indent: false, logLevel});
	}

	Log.warn(logOptions, 'You may experience breakages such as:');
	Log.warn(logOptions, '- React context and hooks not working');
	Log.warn(logOptions, '- Type errors and feature incompatibilities');
	Log.warn(logOptions, '- Failed renders and unclear errors');
	Log.warn(logOptions);
	Log.warn(logOptions, 'To resolve:');
	Log.warn(
		logOptions,
		'- Make sure your package.json has all Remotion packages pointing to the same version.',
	);
	Log.warn(
		logOptions,
		'- Remove the `^` character in front of a version to pin a package.',
	);
	if (!RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose')) {
		Log.warn(
			logOptions,
			'- Run `npx remotion versions --log=verbose` to see the path of the modules resolved.',
		);
	}

	Log.warn(logOptions, '-------------');
	Log.info({indent: false, logLevel});
};

export const versionsCommand = async (
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	parseCommandLine();
	const versions = await getAllVersions(remotionRoot);

	const grouped = groupBy(versions);

	const installedVersions = Object.keys(grouped);

	Log.info(
		{indent: false, logLevel},
		`Node.JS = ${process.version}, OS = ${process.platform}`,
	);
	Log.info({indent: false, logLevel});
	for (const version of installedVersions) {
		Log.info({indent: false, logLevel}, `On version: ${version}`);
		for (const pkg of grouped[version] ?? []) {
			Log.info({indent: false, logLevel}, `- ${pkg}`);
			Log.verbose(
				{indent: false, logLevel},
				`  ${resolveFrom(remotionRoot, `${pkg}/package.json`)}`,
			);
		}

		Log.info({indent: false, logLevel});
	}

	if (installedVersions.length === 0) {
		Log.info({indent: false, logLevel}, 'No Remotion packages found.');
		Log.info(
			{indent: false, logLevel},
			'Maybe @remotion/cli is installed globally.',
		);

		Log.info(
			{indent: false, logLevel},
			'If you try to render a video that was bundled with a different version, you will get a warning.',
		);
		process.exit(1);
	}

	if (installedVersions.length === 1) {
		Log.info(
			{indent: false, logLevel},
			`✅ Great! All packages have the same version.`,
		);
	} else {
		Log.error(
			{indent: false, logLevel},
			'Version mismatch: Not all Remotion packages have the same version.',
		);
		Log.info(
			{indent: false, logLevel},
			'- Make sure your package.json has all Remotion packages pointing to the same version.',
		);
		Log.info(
			{indent: false, logLevel},
			'- Remove the `^` character in front of a version to pin a package.',
		);
		if (!RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose')) {
			Log.info(
				{indent: false, logLevel},
				'- Rerun this command with --log=verbose to see the path of the modules resolved.',
			);
		}

		process.exit(1);
	}
};
