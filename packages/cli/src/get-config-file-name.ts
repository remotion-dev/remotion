import {parsedCli} from './parse-command-line';

let defaultConfigFile = 'remotion.config.ts';
const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';

export const getConfigFileName = (isJavascript: boolean): string => {
	defaultConfigFile = isJavascript
		? defaultConfigFileJavascript
		: defaultConfigFileTypescript;
	return parsedCli.config ?? defaultConfigFile;
};

export const isDefaultConfigFile = (fileName: string) => {
	return fileName === defaultConfigFile;
};
