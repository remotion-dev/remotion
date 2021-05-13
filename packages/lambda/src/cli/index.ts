import minimist from 'minimist';
import {printHelp} from './help';

type LambdaCommandLineOptions = {
	help: boolean;
};

const parsedCli = minimist<LambdaCommandLineOptions>(process.argv.slice(2));

export const cli = async () => {
	if (parsedCli.help) {
		printHelp();
	}
};
