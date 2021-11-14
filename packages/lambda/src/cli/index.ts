import {CliInternals} from '@remotion/cli';
import {ROLE_NAME} from '../api/iam-validation/suggested-policy';
import {checkCredentials} from '../shared/check-credentials';
import {DOCS_URL} from '../shared/docs-url';
import {parsedLambdaCli} from './args';
import {functionsCommand, FUNCTIONS_COMMAND} from './commands/functions';
import {policiesCommand, POLICIES_COMMAND} from './commands/policies/policies';
import {ROLE_SUBCOMMAND} from './commands/policies/role';
import {USER_SUBCOMMAND} from './commands/policies/user';
import {renderCommand, RENDER_COMMAND} from './commands/render/render';
import {sitesCommand, SITES_COMMAND} from './commands/sites';
import {stillCommand, STILL_COMMAND} from './commands/still';
import {printHelp} from './help';
import {quit} from './helpers/quit';
import {Log} from './log';

const requiresCredentials = (args: string[]) => {
	if (args[0] === POLICIES_COMMAND) {
		if (args[1] === USER_SUBCOMMAND) {
			return false;
		}

		if (args[1] === ROLE_SUBCOMMAND) {
			return false;
		}
	}

	return true;
};

const matchCommand = async (args: string[]) => {
	if (parsedLambdaCli.help || args.length === 0) {
		printHelp();
		quit(0);
	}

	if (requiresCredentials(args)) {
		checkCredentials();
	}

	if (args[0] === RENDER_COMMAND) {
		return renderCommand(args.slice(1));
	}

	if (args[0] === STILL_COMMAND) {
		return stillCommand(args.slice(1));
	}

	if (args[0] === FUNCTIONS_COMMAND) {
		return functionsCommand(args.slice(1));
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
		Log.info('After: remotion lambda sites create <entry-point>');
		quit(1);
	}

	if (args[0] === 'deploy') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda deploy');
		Log.info('After: remotion lambda functions deploy');
		quit(1);
	}

	if (args[0] === 'ls') {
		Log.info(`The "ls" command does not exist.`);
		Log.info(`Did you mean "functions ls" or "sites ls"?`);
	}

	if (args[0] === 'rm') {
		Log.info(`The "rm" command does not exist.`);
		Log.info(`Did you mean "functions rm" or "sites rm"?`);
	}

	if (args[0] === 'deploy') {
		Log.info(`The "deploy" command does not exist.`);
		Log.info(`Did you mean "functions deploy"?`);
	}

	Log.error(`Command ${args[0]} not found.`);
	printHelp();
	quit(1);
};

export const executeCommand = async (args: string[]) => {
	try {
		await matchCommand(args);
	} catch (err) {
		const error = err as Error;
		if (
			error.message.includes(
				'The role defined for the function cannot be assumed by Lambda'
			)
		) {
			Log.error(
				`
The role "${ROLE_NAME}" does not exist in your AWS account or has the wrong policy assigned to it. Common reasons:
- The name of the role is not "${ROLE_NAME}"
- The policy is not exactly as specified in the setup guide

Revisit ${DOCS_URL}/docs/lambda/setup and make sure you set up the role and role policy correctly. The original error message is:
`.trim()
			);
		}

		if (error.stack?.includes('AccessDenied')) {
			// TODO: Explain permission problem
			Log.error('PERMISSION PROBLEM PUT HELPFUL MESSAGE HERE');
		}

		Log.error(error.stack);
		quit(1);
	}
};

export const cli = async () => {
	CliInternals.initializeRenderCli('lambda');

	await executeCommand(parsedLambdaCli._);
};
