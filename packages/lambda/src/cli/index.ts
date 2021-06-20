import {CliInternals} from '@remotion/cli';
import {parsedLambdaCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {deployCommand, DEPLOY_COMMAND} from './deploy';
import {printHelp} from './help';
import {Log} from './log';
import {policiesCommand, POLICIES_COMMAND} from './policies';
import {renderCommand, RENDER_COMMAND} from './render';
import {uploadCommand, UPLOAD_COMMAND} from './upload';

const matchCommand = async () => {
	if (parsedLambdaCli.help || parsedLambdaCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedLambdaCli._[0] === DEPLOY_COMMAND) {
		return deployCommand();
	}

	if (parsedLambdaCli._[0] === UPLOAD_COMMAND) {
		return uploadCommand();
	}

	if (parsedLambdaCli._[0] === RENDER_COMMAND) {
		return renderCommand();
	}

	if (parsedLambdaCli._[0] === CLEANUP_COMMAND) {
		return cleanupCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === POLICIES_COMMAND) {
		return policiesCommand(parsedLambdaCli._.slice(1));
	}

	Log.error(`Command ${parsedLambdaCli._[0]} not found.`);
	printHelp();
	process.exit(1);
};

export const cli = async () => {
	// TODO: TS hardcoded, support JS just as in normal CLI
	CliInternals.loadConfigFile(CliInternals.getConfigFileName(false), false);
	CliInternals.parseCommandLine();
	try {
		await matchCommand();
	} catch (err) {
		if (
			err.stack.includes('AccessDenied') ||
			err.stack.includes('AccessDeniedException')
		) {
			Log.error('PERMISSION PROBLEM PUT HELPFUL MESSAGE HERE');
		}

		Log.error(err.stack);
		process.exit(1);
	}
};
