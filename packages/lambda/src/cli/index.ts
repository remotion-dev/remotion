import {CliInternals} from '@remotion/cli';
import {parsedLambdaCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {functionsCommand, FUNCTIONS_COMMAND} from './commands/functions';
import {sitesCommand, SITES_COMMAND} from './commands/sites';
import {printHelp} from './help';
import {Log} from './log';
import {policiesCommand, POLICIES_COMMAND} from './policies';
import {renderCommand, RENDER_COMMAND} from './render';

const matchCommand = async () => {
	if (parsedLambdaCli.help || parsedLambdaCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedLambdaCli._[0] === RENDER_COMMAND) {
		return renderCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === FUNCTIONS_COMMAND) {
		return functionsCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === CLEANUP_COMMAND) {
		return cleanupCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === POLICIES_COMMAND) {
		return policiesCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === SITES_COMMAND) {
		return sitesCommand(parsedLambdaCli._.slice(1));
	}

	if (parsedLambdaCli._[0] === 'upload') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda upload <entry-point>');
		Log.info('After: remotion-lambda sites create <entry-point>');
		process.exit(1);
	}

	if (parsedLambdaCli._[0] === 'deploy') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda deploy');
		Log.info('After: remotion-lambda functions deploy');
		process.exit(1);
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
