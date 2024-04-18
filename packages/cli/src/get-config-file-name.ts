import {existsSync} from 'node:fs';
import path from 'node:path';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';

export const loadConfig = (remotionRoot: string): Promise<string | null> => {
	if (parsedCli.config) {
		const fullPath = path.resolve(process.cwd(), parsedCli.config);
		if (!existsSync(fullPath)) {
			Log.error(
				{indent: false, logLevel: 'error'},
				`You specified a config file location of "${parsedCli.config}" but no file under ${fullPath} was found.`,
			);
			process.exit(1);
		}

		return loadConfigFile(
			remotionRoot,
			parsedCli.config,
			fullPath.endsWith('.js'),
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
