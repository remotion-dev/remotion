import {existsSync} from 'node:fs';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {
	executeConfigFile,
	loadConfigFile,
	prepareConfigFile,
} from './load-config';
import type {PreparedConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const {configOption} = BrowserSafeApis.options;

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';
let loadedConfigFile: PreparedConfigFile | null = null;

export const getLoadedConfigFile = () => loadedConfigFile?.resolved ?? null;

const loadInitialConfigFile = async (
	remotionRoot: string,
	configFileName: string,
	isJavascript: boolean,
) => {
	try {
		return await loadConfigFile(remotionRoot, configFileName, isJavascript);
	} catch (error) {
		Log.error(
			{indent: false, logLevel: 'error'},
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
};

export const loadConfig = async (
	remotionRoot: string,
): Promise<string | null> => {
	const configFile = configOption.getValue({commandLine: parsedCli}).value;
	if (configFile) {
		const fullPath = path.resolve(process.cwd(), configFile);
		if (!existsSync(fullPath)) {
			Log.error(
				{indent: false, logLevel: 'error'},
				`You specified a config file location of "${configFile}" but no file under ${fullPath} was found.`,
			);
			process.exit(1);
		}

		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			configFile,
			fullPath.endsWith('.js'),
		);
		return loadedConfigFile.resolved;
	}

	if (remotionRoot === null) {
		loadedConfigFile = null;
		return null;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileTypescript))) {
		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			defaultConfigFileTypescript,
			false,
		);
		return loadedConfigFile.resolved;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileJavascript))) {
		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			defaultConfigFileJavascript,
			true,
		);
		return loadedConfigFile.resolved;
	}

	loadedConfigFile = null;
	return null;
};

export const reloadConfig = async ({
	resetConfigOptions,
}: {
	resetConfigOptions: () => void;
}): Promise<boolean> => {
	if (!loadedConfigFile) {
		return false;
	}

	const previousConfigFile = loadedConfigFile;
	let nextConfigFile: PreparedConfigFile;

	try {
		nextConfigFile = await prepareConfigFile(
			previousConfigFile.remotionRoot,
			previousConfigFile.resolved,
			previousConfigFile.resolved.endsWith('.js'),
		);
	} catch (error) {
		Log.error(
			{indent: false, logLevel: 'error'},
			'Could not reload the Remotion config. Keeping the previous configuration.',
			error instanceof Error ? error.message : String(error),
		);
		return false;
	}

	resetConfigOptions();
	try {
		executeConfigFile(nextConfigFile);
		loadedConfigFile = nextConfigFile;
		return true;
	} catch (error) {
		resetConfigOptions();
		executeConfigFile(previousConfigFile);
		Log.error(
			{indent: false, logLevel: 'error'},
			'Could not reload the Remotion config. Keeping the previous configuration.',
			error instanceof Error ? error.message : String(error),
		);
		return false;
	}
};
