import {parsedCli} from './parse-command-line';

const defaultConfigFileTypescript = 'remotion.config.ts';
const defaultConfigFileJavascript = 'remotion.config.js';

export const getConfigFileName = (isJavascript: boolean): string => {
	return parsedCli.config ?? isJavascript
		? defaultConfigFileJavascript
		: defaultConfigFileTypescript;
};

export const isDefaultConfigFile = (fileName: string) => {
	return fileName === defaultConfigFileTypescript;
};
