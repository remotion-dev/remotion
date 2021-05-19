import {parsedCli} from './args';
import {cleanupCommand} from './cleanup';
import {deployCommand} from './deploy';
import {printHelp} from './help';
import {Log} from './log';
import {renderCommand} from './render';

export const cli = async () => {
	if (parsedCli.help || parsedCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedCli._[0] === 'deploy') {
		return deployCommand();
	}

	if (parsedCli._[0] === 'render') {
		return renderCommand();
	}

	if (parsedCli._[0] === 'cleanup') {
		return cleanupCommand();
	}

	Log.error(`Command ${parsedCli._[0]} not found.`);
	printHelp();
	process.exit(1);
};
