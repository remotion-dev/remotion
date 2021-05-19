import {parsedCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
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

	if (parsedCli._[0] === CLEANUP_COMMAND) {
		return cleanupCommand(parsedCli._.slice(1));
	}

	Log.error(`Command ${parsedCli._[0]} not found.`);
	printHelp();
	process.exit(1);
};
