import minimist from 'minimist';

type LambdaCommandLineOptions = {
	help: boolean;
};

export const parsedCli = minimist<LambdaCommandLineOptions>(
	process.argv.slice(2)
);
