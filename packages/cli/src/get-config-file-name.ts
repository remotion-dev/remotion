import minimist from 'minimist';

const defaultConfigFile = 'remotion.config.ts';

export const getConfigFileName = (): string => {
	const arg = minimist<{
		config: string;
	}>(process.argv.slice(2));
	return arg.config ?? defaultConfigFile;
};

export const isDefaultConfigFile = (fileName: string) => {
	return fileName === defaultConfigFile;
};
