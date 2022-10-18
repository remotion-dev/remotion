import {existsSync} from 'fs';
import path from 'path';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
export const defaultConfigFileJavascript = 'remotion.config.js';
export const defaultConfigFileTypescript = 'remotion.config.ts';

export const loadConfig = (remotionRoot: string): Promise<string | null> => {
	if (parsedCli.config) {
		const fullPath = path.resolve(process.cwd(), parsedCli.config);
		if (!existsSync(fullPath)) {
			Log.error(
				`You specified a config file location of "${parsedCli.config}" but no file under ${fullPath} was found.`
			);
			process.exit(1);
		}

		return loadConfigFile(
			remotionRoot,
			parsedCli.config,
			fullPath.endsWith('.js')
		);
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
