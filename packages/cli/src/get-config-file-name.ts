import {parsedCli} from './parse-command-line';

const defaultConfigFile = 'remotion.config.ts';

export const getConfigFileName = (): string => {
	return parsedCli.config ?? defaultConfigFile;
};

export const isDefaultConfigFile = (fileName: string) => {
	return fileName === defaultConfigFile;
};
