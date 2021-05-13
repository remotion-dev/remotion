import {parsedCli} from './args';
import {deployCommand} from './deploy';
import {printHelp} from './help';
import {Log} from './log';

export const cli = async () => {
	if (parsedCli.help || parsedCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedCli._[0] === 'deploy') {
		await deployCommand();
	} else {
		Log.error(`Command ${parsedCli._[0]} not found.`);
		printHelp();
		process.exit(1);
	}
};
