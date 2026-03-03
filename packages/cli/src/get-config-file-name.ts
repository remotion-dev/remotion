import {existsSync} from 'node:fs';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import type {ParsedCommandLine} from './parsed-cli';
import {parsedCli} from './parsed-cli';

const {configOption} = BrowserSafeApis.options;

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';

export const loadConfig = (
	remotionRoot: string,
	commandLine: ParsedCommandLine = parsedCli,
): Promise<string | null> => {
	const configFile = configOption.getValue({commandLine}).value;
	if (configFile) {
		const fullPath = path.resolve(process.cwd(), configFile);
		if (!existsSync(fullPath)) {
			Log.error(
				{indent: false, logLevel: 'error'},
				`You specified a config file location of "${configFile}" but no file under ${fullPath} was found.`,
			);
			process.exit(1);
		}

		return loadConfigFile(remotionRoot, configFile, fullPath.endsWith('.js'));
	}

	if (remotionRoot === null) {
		return Promise.resolve(null);
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileTypescript))) {
		return loadConfigFile(remotionRoot, defaultConfigFileTypescript, false);
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileJavascript))) {
		return loadConfigFile(remotionRoot, defaultConfigFileJavascript, true);
	}

	return Promise.resolve(null);
};
