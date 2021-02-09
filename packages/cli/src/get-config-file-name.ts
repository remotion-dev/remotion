import minimist from 'minimist';

const defaultConfigFile = 'config.ts';

export const getConfigFileName = (): string => {
	const arg = minimist<{
		config: string;
	}>(process.argv.slice(2));
	return arg.config ?? defaultConfigFile;
};
