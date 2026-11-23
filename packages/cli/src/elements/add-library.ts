import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {StudioServerInternals} from '@remotion/studio-server';
import {normalizeHttpUrl} from '@remotion/studio-shared';
import minimist from 'minimist';
import {chalk} from '../chalk';
import {ConfigInternals} from '../config';
import {getLoadedConfigFile} from '../get-config-file-name';
import {Log} from '../log';
import {fetchElementPage} from './fetch-element-page';
import {USE_COMMAND} from './use';

export const ADD_LIBRARY_COMMAND = 'add-library';

export const elementsAddLibraryCommand = async ({
	remotionRoot,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}) => {
	const fail = (message: string): never => {
		Log.error({indent: false, logLevel}, message);
		process.exit(1);
	};

	const commandLine = minimist(argv, {
		string: ['_', 'display-name'],
	});
	const [, , libraryUrl, ...extraArgs] = commandLine._;
	if (libraryUrl === undefined || extraArgs.length > 0) {
		return fail(
			`Usage: npx remotion elements ${ADD_LIBRARY_COMMAND} <url> [--display-name <name>]`,
		);
	}

	const url = normalizeHttpUrl(libraryUrl);
	if (url === null) {
		return fail(`"${libraryUrl}" is not a valid http:// or https:// URL.`);
	}

	const requestedDisplayName: unknown = commandLine['display-name'];
	if (
		requestedDisplayName !== undefined &&
		(typeof requestedDisplayName !== 'string' ||
			requestedDisplayName.trim() === '')
	) {
		return fail('--display-name must be passed once and must not be empty.');
	}

	const configFile = getLoadedConfigFile();
	if (configFile === null) {
		return fail(
			`No Remotion config file found in ${remotionRoot}. Create a remotion.config.ts file to add an Element Library: https://www.remotion.dev/docs/config`,
		);
	}

	const configFileName = path.relative(process.cwd(), configFile);
	const existingUrls = ConfigInternals.getElementLibraries().map(
		(library) => library.url,
	);
	const alreadyAdded = () => {
		Log.info(
			{indent: false, logLevel},
			`${url} is already added to ${configFileName}. No files were changed.`,
		);
	};

	if (existingUrls.includes(url)) {
		return alreadyAdded();
	}

	Log.verbose({indent: false, logLevel}, `Fetching ${url}`);
	const page = await fetchElementPage(new URL(url)).catch((err: Error) =>
		fail(err.message),
	);
	const displayName =
		requestedDisplayName?.trim() ??
		(page.isJson
			? null
			: StudioProtocolInternals.parseElementPayloadsFromHtml(page.text)
					.siteName);
	const configContents = readFileSync(configFile, 'utf-8');
	let updatedConfig: string;
	try {
		updatedConfig = StudioServerInternals.updateConfigFile({
			configContents,
			existingElementLibraryUrls: existingUrls,
			updates: [
				{
					setter: 'addElementLibrary',
					type: 'set',
					value: displayName === null ? {url} : {url, displayName},
				},
			],
		});
	} catch (err) {
		return fail(
			`Could not update ${configFileName}: ${(err as Error).message}`,
		);
	}

	if (updatedConfig === configContents) {
		return alreadyAdded();
	}

	writeFileSync(configFile, updatedConfig);
	Log.info(
		{indent: false, logLevel},
		chalk.green(
			`Added ${displayName === null ? url : `${displayName} (${url})`} to ${configFileName}.`,
		),
	);
	Log.info(
		{indent: false, logLevel},
		`Install an Element from it with "npx remotion elements ${USE_COMMAND} <element-page-url>".`,
	);
};
