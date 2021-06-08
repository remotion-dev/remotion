import {CliInternals} from '@remotion/cli';
import {parsedCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {deployCommand, DEPLOY_COMMAND} from './deploy';
import {printHelp} from './help';
import {infoCommand} from './info';
import {Log} from './log';
import {policiesCommand, POLICIES_COMMAND} from './policies';
import {renderCommand, RENDER_COMMAND} from './render';
import {uploadCommand, UPLOAD_COMMAND} from './upload';

const matchCommand = async () => {
	if (parsedCli.help || parsedCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedCli._[0] === 'info') {
		return infoCommand();
	}

	if (parsedCli._[0] === DEPLOY_COMMAND) {
		return deployCommand();
	}

	if (parsedCli._[0] === UPLOAD_COMMAND) {
		return uploadCommand();
	}

	if (parsedCli._[0] === RENDER_COMMAND) {
		return renderCommand();
	}

	if (parsedCli._[0] === CLEANUP_COMMAND) {
		return cleanupCommand(parsedCli._.slice(1));
	}

	if (parsedCli._[0] === POLICIES_COMMAND) {
		return policiesCommand(parsedCli._.slice(1));
	}

	Log.error(`Command ${parsedCli._[0]} not found.`);
	printHelp();
	process.exit(1);
};

export const cli = async () => {
	CliInternals.loadConfigFile(CliInternals.getConfigFileName());
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
