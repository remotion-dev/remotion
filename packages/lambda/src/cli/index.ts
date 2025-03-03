import {CliInternals} from '@remotion/cli';
import {AwsProvider, LambdaClientInternals} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {
	DOCS_URL,
	FullClientSpecifics,
	type ProviderSpecifics,
} from '@remotion/serverless';
import {ROLE_NAME} from '../api/iam-validation/suggested-policy';
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {parsedLambdaCli} from './args';
import {
	COMPOSITIONS_COMMAND,
	compositionsCommand,
} from './commands/compositions';
import {FUNCTIONS_COMMAND, functionsCommand} from './commands/functions';
import {POLICIES_COMMAND, policiesCommand} from './commands/policies/policies';
import {ROLE_SUBCOMMAND} from './commands/policies/role';
import {USER_SUBCOMMAND} from './commands/policies/user';
import {QUOTAS_COMMAND, quotasCommand} from './commands/quotas';
import {REGIONS_COMMAND, regionsCommand} from './commands/regions';
import {RENDER_COMMAND, renderCommand} from './commands/render/render';
import {SITES_COMMAND, sitesCommand} from './commands/sites';
import {STILL_COMMAND, stillCommand} from './commands/still';
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

	if (args[0] === REGIONS_COMMAND) {
		return false;
	}

	return true;
};

const matchCommand = ({
	args,
	remotionRoot,
	logLevel,
	providerSpecifics,
	fullClientSpecifics,
}: {
	args: string[];
	remotionRoot: string;
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
	fullClientSpecifics: FullClientSpecifics<AwsProvider>;
}) => {
	if (parsedLambdaCli.help || args.length === 0) {
		printHelp(logLevel);
		quit(0);
	}

	if (requiresCredentials(args)) {
		providerSpecifics.checkCredentials();
	}

	if (args[0] === RENDER_COMMAND) {
		return renderCommand({
			args: args.slice(1),
			remotionRoot,
			logLevel,
			providerSpecifics,
		});
	}

	if (args[0] === STILL_COMMAND) {
		return stillCommand({
			args: args.slice(1),
			remotionRoot,
			logLevel,
			providerSpecifics: providerSpecifics,
		});
	}

	if (args[0] === COMPOSITIONS_COMMAND) {
		return compositionsCommand({
			args: args.slice(1),
			logLevel,
			providerSpecifics,
		});
	}

	if (args[0] === FUNCTIONS_COMMAND) {
		return functionsCommand({
			args: args.slice(1),
			logLevel,
			fullClientSpecifics,
			providerSpecifics,
		});
	}

	if (args[0] === QUOTAS_COMMAND) {
		return quotasCommand(args.slice(1), logLevel);
	}

	if (args[0] === POLICIES_COMMAND) {
		return policiesCommand(args.slice(1), logLevel);
	}

	if (args[0] === REGIONS_COMMAND) {
		return regionsCommand(logLevel);
	}

	if (args[0] === SITES_COMMAND) {
		return sitesCommand(
			args.slice(1),
			remotionRoot,
			logLevel,
			providerSpecifics,
		);
	}

	if (args[0] === 'upload') {
		Log.info({indent: false, logLevel}, 'The command has been renamed.');
		Log.info(
			{indent: false, logLevel},
			'Before: remotion-lambda upload <entry-point>',
		);
		Log.info(
			{indent: false, logLevel},
			'After: remotion lambda sites create <entry-point>',
		);
		quit(1);
	}

	if (args[0] === 'deploy') {
		Log.info({indent: false, logLevel}, 'The command has been renamed.');
		Log.info({indent: false, logLevel}, 'Before: remotion-lambda deploy');
		Log.info(
			{indent: false, logLevel},
			'After: remotion lambda functions deploy',
		);
		quit(1);
	}

	if (args[0] === 'ls') {
		Log.info({indent: false, logLevel}, `The "ls" command does not exist.`);
		Log.info(
			{indent: false, logLevel},
			`Did you mean "functions ls" or "sites ls"?`,
		);
	}

	if (args[0] === 'rm') {
		Log.info({indent: false, logLevel}, `The "rm" command does not exist.`);
		Log.info(
			{indent: false, logLevel},
			`Did you mean "functions rm" or "sites rm"?`,
		);
	}

	if (args[0] === 'deploy') {
		Log.info({indent: false, logLevel}, `The "deploy" command does not exist.`);
		Log.info({indent: false, logLevel}, `Did you mean "functions deploy"?`);
	}

	Log.error({indent: false, logLevel}, `Command ${args[0]} not found.`);
	printHelp(logLevel);
	quit(1);
};

export const executeCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
	_providerSpecifics: ProviderSpecifics<AwsProvider> | null,
	fullClientSpecifics: FullClientSpecifics<AwsProvider> | null,
) => {
	try {
		const providerSpecifics =
			_providerSpecifics ?? LambdaClientInternals.awsImplementation;
		await matchCommand({
			args,
			remotionRoot,
			logLevel,
			providerSpecifics: providerSpecifics,
			fullClientSpecifics: fullClientSpecifics ?? awsFullClientSpecifics,
		});
	} catch (err) {
		const error = err as Error;
		if (
			error.message.includes(
				'The role defined for the function cannot be assumed by Lambda',
			)
		) {
			if (parsedLambdaCli['custom-role-arn']) {
				Log.error(
					{indent: false, logLevel},
					`
	The role "${parsedLambdaCli['custom-role-arn']}" does not exist or has the wrong policy assigned to it. Do either:
	- Remove the "--custom-role-arn" parameter and set up Remotion Lambda according to the setup guide
	- Make sure the role has the same policy assigned as the one returned by "npx ${BINARY_NAME} ${POLICIES_COMMAND} ${ROLE_SUBCOMMAND}"
	
	Revisit ${DOCS_URL}/docs/lambda/setup and make sure you set up the role and role policy correctly. Also see the troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/permissions. The original error message is:
	`.trim(),
				);
			}

			Log.error(
				{indent: false, logLevel},
				`
The role "${ROLE_NAME}" does not exist in your AWS account or has the wrong policy assigned to it. Common reasons:
- The name of the role is not "${ROLE_NAME}"
- The policy is not exactly as specified in the setup guide

Revisit ${DOCS_URL}/docs/lambda/setup and make sure you set up the role and role policy correctly. Also see the troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/permissions. The original error message is:
`.trim(),
			);
		}

		if (error.stack?.includes('AccessDenied')) {
			Log.error(
				{indent: false, logLevel},
				`
AWS returned an "AccessDenied" error message meaning a permission is missing. Read the permissions troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/permissions. The original error message is:
`.trim(),
			);
		}

		if (error.stack?.includes('TooManyRequestsException')) {
			Log.error(
				{indent: false, logLevel},
				`
AWS returned an "TooManyRequestsException" error message which could mean you reached the concurrency limit of AWS Lambda. You can increase the limit - read this troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/rate-limit. The original error message is:
`.trim(),
			);
		}

		if (
			error.stack?.includes(
				'The security token included in the request is invalid',
			)
		) {
			const keyButDoesntStartWithAki =
				LambdaClientInternals.getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') &&
				!(
					LambdaClientInternals.getEnvVariable(
						'REMOTION_AWS_ACCESS_KEY_ID',
					) as string
				).startsWith('AKI');
			const pureKeyButDoesntStartWithAki =
				LambdaClientInternals.getEnvVariable('AWS_ACCESS_KEY_ID') &&
				!(
					LambdaClientInternals.getEnvVariable('AWS_ACCESS_KEY_ID') as string
				).startsWith('AKI');
			if (keyButDoesntStartWithAki || pureKeyButDoesntStartWithAki) {
				Log.error(
					{indent: false, logLevel},
					`
	AWS returned an error message "The security token included in the request is invalid". A possible reason is that your AWS Access key ID is set but doesn't start with "AKI", which it usually should. The original message is: 
	`,
				);
			} else {
				Log.error(
					{indent: false, logLevel},
					`
AWS returned an error message "The security token included in the request is invalid". A possible reason for this is that you did not enable the region in your AWS account under "Account". The original message is: 
`,
				);
			}
		}

		if (error instanceof RenderInternals.SymbolicateableError) {
			await CliInternals.printError(error, logLevel);
		} else {
			const frames = RenderInternals.parseStack(error.stack?.split('\n') ?? []);

			const errorWithStackFrame = new RenderInternals.SymbolicateableError({
				message: error.message,
				frame: null,
				name: error.name,
				stack: error.stack,
				stackFrame: frames,
				chunk: null,
			});
			await CliInternals.printError(errorWithStackFrame, logLevel);
		}

		quit(1);
	}
};

export const cli = async (logLevel: LogLevel) => {
	const remotionRoot = RenderInternals.findRemotionRoot();
	await CliInternals.initializeCli(remotionRoot);

	await executeCommand(
		parsedLambdaCli._,
		remotionRoot,
		logLevel,
		LambdaClientInternals.awsImplementation,
		awsFullClientSpecifics,
	);
};
