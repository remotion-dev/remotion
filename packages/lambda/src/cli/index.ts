import {CliInternals} from '@remotion/cli';
import {checkCredentials} from '../shared/check-credentials';
import {parsedLambdaCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {functionsCommand, FUNCTIONS_COMMAND} from './commands/functions';
import {policiesCommand, POLICIES_COMMAND} from './commands/policies/policies';
import {sitesCommand, SITES_COMMAND} from './commands/sites';
import {printHelp} from './help';
import {Log} from './log';
import {renderCommand, RENDER_COMMAND} from './render';

const matchCommand = async (args: string[]) => {
	checkCredentials();
	if (parsedLambdaCli.help || args.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (args[0] === RENDER_COMMAND) {
		return renderCommand(args.slice(1));
	}

	if (args[0] === FUNCTIONS_COMMAND) {
		return functionsCommand(args.slice(1));
	}

	if (args[0] === CLEANUP_COMMAND) {
		return cleanupCommand(args.slice(1));
	}

	if (args[0] === POLICIES_COMMAND) {
		return policiesCommand(args.slice(1));
	}

	if (args[0] === SITES_COMMAND) {
		return sitesCommand(args.slice(1));
	}

	if (args[0] === 'upload') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda upload <entry-point>');
		Log.info('After: remotion-lambda sites create <entry-point>');
		process.exit(1);
	}

	if (args[0] === 'deploy') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda deploy');
		Log.info('After: remotion-lambda functions deploy');
		process.exit(1);
	}

	Log.error(`Command ${args[0]} not found.`);
	printHelp();
	process.exit(1);
};

export const executeCommand = async (args: string[]) => {
	try {
		await matchCommand(args);
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

export const cli = async () => {
	// TODO: TS hardcoded, support JS just as in normal CLI
	CliInternals.loadConfigFile(CliInternals.getConfigFileName(false), false);
	CliInternals.parseCommandLine();
	await executeCommand(parsedLambdaCli._);
};
