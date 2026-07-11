import {existsSync} from 'node:fs';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const {configOption} = BrowserSafeApis.options;

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';
let loadedConfigFile: string | null = null;

export const getLoadedConfigFile = () => loadedConfigFile;

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

		loadedConfigFile = await loadConfigFile(
			remotionRoot,
			configFile,
			fullPath.endsWith('.js'),
		);
		return loadedConfigFile;
	}

	if (remotionRoot === null) {
		loadedConfigFile = null;
		return null;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileTypescript))) {
		loadedConfigFile = await loadConfigFile(
			remotionRoot,
			defaultConfigFileTypescript,
			false,
		);
		return loadedConfigFile;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileJavascript))) {
		loadedConfigFile = await loadConfigFile(
			remotionRoot,
			defaultConfigFileJavascript,
			true,
		);
		return loadedConfigFile;
	}

	loadedConfigFile = null;
	return null;
};
