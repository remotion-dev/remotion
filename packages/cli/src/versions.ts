import type {LogLevel, LogOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import {ConfigInternals} from './config';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';
import {resolveFrom} from './resolve-from';

const getVersion = async (
	remotionRoot: string,
	p: string,
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
	remotionRoot: string,
): Promise<[string, string][]> => {
	return (
		await Promise.all(
			listOfRemotionPackages.map(
				async (p) => [p, await getVersion(remotionRoot, p)] as [string, string],
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

	const logOptions: LogOptions = {indent: false, logLevel};
	Log.warnAdvanced(logOptions, '-------------');
	Log.warnAdvanced(logOptions, 'Version mismatch:');
	for (const version of installedVersions) {
		Log.warnAdvanced(logOptions, `- On version: ${version}`);
		for (const pkg of grouped[version]) {
			Log.warnAdvanced(logOptions, `  - ${pkg}`);
		}

		Log.info();
	}

	Log.warnAdvanced(logOptions, 'You may experience breakages such as:');
	Log.warnAdvanced(logOptions, '- React context and hooks not working');
	Log.warnAdvanced(logOptions, '- Type errors and feature incompatibilities');
	Log.warnAdvanced(logOptions, '- Failed renders and unclear errors');
	Log.warnAdvanced(logOptions);
	Log.warnAdvanced(logOptions, 'To resolve:');
	Log.warnAdvanced(
		logOptions,
		'- Make sure your package.json has all Remotion packages pointing to the same version.',
	);
	Log.warnAdvanced(
		logOptions,
		'- Remove the `^` character in front of a version to pin a package.',
	);
	if (
		!RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose',
		)
	) {
		Log.warnAdvanced(
			logOptions,
			'- Run `npx remotion versions --log=verbose` to see the path of the modules resolved.',
		);
	}

	Log.warnAdvanced(logOptions, '-------------');
	Log.info();
};

export const versionsCommand = async (
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	parseCommandLine();
	const versions = await getAllVersions(remotionRoot);

	const grouped = groupBy(versions);

	const installedVersions = Object.keys(grouped);

	Log.info(`Node.JS = ${process.version}, OS = ${process.platform}`);
	Log.info();
	for (const version of installedVersions) {
		Log.info(`On version: ${version}`);
		for (const pkg of grouped[version]) {
			Log.info(`- ${pkg}`);
			Log.verboseAdvanced(
				{indent: false, logLevel},
				`  ${resolveFrom(remotionRoot, `${pkg}/package.json`)}`,
			);
		}

		Log.info();
	}

	if (installedVersions.length === 1) {
		Log.info(`✅ Great! All packages have the same version.`);
	} else {
		Log.error(
			'Version mismatch: Not all Remotion packages have the same version.',
		);
		Log.info(
			'- Make sure your package.json has all Remotion packages pointing to the same version.',
		);
		Log.info(
			'- Remove the `^` character in front of a version to pin a package.',
		);
		if (
			!RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose',
			)
		) {
			Log.info(
				'- Rerun this command with --log=verbose to see the path of the modules resolved.',
			);
		}

		process.exit(1);
	}
};
