import {Log} from './log';
import {quit} from './helpers/quit';
import {parsedGcpCli} from './args';
import {cloudRunCommand, CLOUD_RUN_COMMAND} from './commands/cloud-run';

const matchCommand = (args: string[], remotionRoot: string) => {
	if (parsedGcpCli.help || args.length === 0) {
		// printHelp(); TODO: implement help
		quit(0);
	}

	if (args[0] === CLOUD_RUN_COMMAND) {
		return cloudRunCommand(args.slice(1));
	}

	if (args[0] === 'deploy') {
		Log.info(`The "deploy" command does not exist.`);
		Log.info(`Did you mean "cloud-run deploy"?`);
	}

	Log.error(`Command ${args[0]} not found.`);
	// printHelp(); TODO: implement help
	quit(1);
};

export const executeCommand = async (args: string[], remotionRoot: string) => {
	try {
		await matchCommand(args, remotionRoot);
	} catch (err) {
		const error = err as Error;
    // catch errors and print a message. Check lambda cli for example

		Log.error(error.stack);
		quit(1);
	}
};