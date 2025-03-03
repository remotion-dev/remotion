import {AwsProvider, LambdaClientInternals} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel, LogOptions} from '@remotion/renderer';
import {ProviderSpecifics} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {parsedLambdaCli} from '../args';
import {FUNCTIONS_COMMAND} from '../commands/functions';
import {FUNCTIONS_DEPLOY_SUBCOMMAND} from '../commands/functions/deploy';
import {FUNCTIONS_LS_SUBCOMMAND} from '../commands/functions/ls';
import {FUNCTIONS_RM_SUBCOMMAND} from '../commands/functions/rm';
import {getAwsRegion} from '../get-aws-region';
import {Log} from '../log';
import {quit} from './quit';

export const findFunctionName = async ({
	logLevel,
	providerSpecifics,
}: {
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}) => {
	const remotionLambdas = await providerSpecifics.getFunctions({
		region: getAwsRegion(),
		compatibleOnly: false,
	});
	const lambdasWithMatchingVersion = remotionLambdas.filter(
		(l) => l.version === VERSION,
	);
	const logOptions: LogOptions = {
		indent: false,
		logLevel,
	};

	const cliFlag = parsedLambdaCli['function-name'];

	if (cliFlag) {
		const compatibleFunctionExists = lambdasWithMatchingVersion.find(
			(l) => l.functionName === cliFlag,
		);
		if (!compatibleFunctionExists) {
			Log.warn(
				{indent: false, logLevel},
				`Function "${cliFlag}" does not match naming convention ${LambdaClientInternals.innerSpeculateFunctionName({diskSizeInMb: '[disk]', memorySizeInMb: '[memory]', timeoutInSeconds: '[timeout]'})}.`,
			);
			Log.warn(
				{indent: false, logLevel},
				'Remotion relies on the naming to determine function information. This is an unsupported workflow.',
			);

			if (lambdasWithMatchingVersion.length > 0) {
				Log.info(logOptions, 'The following functions were found:');
				for (const l of lambdasWithMatchingVersion) {
					Log.info(logOptions, `- ${l.functionName} (v${l.version})`);
				}

				Log.info(
					logOptions,
					'Prefer using one of those functions by passing their name to  `--function-name` or removing it entirely.',
				);
			}
		}

		return cliFlag;
	}

	if (lambdasWithMatchingVersion.length === 0) {
		Log.error(
			{indent: false, logLevel},
			`No Lambda functions with version ${VERSION} found in your account.`,
		);
		if (remotionLambdas.length > 0) {
			Log.error(
				{indent: false, logLevel},
				'Other functions were found, but are not compatible with this version of the CLI.',
			);
		}

		Log.info(logOptions, 'Run');
		Log.info(
			logOptions,
			`  npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`,
		);
		Log.info(logOptions, `to deploy a new Lambda function.`);
		quit(1);
	}

	if (lambdasWithMatchingVersion.length > 1) {
		Log.error(
			{indent: false, logLevel},
			'More than 1 lambda function found in your account. Unsure which one to use.',
		);
		Log.info(logOptions);
		Log.info(logOptions, 'Possible solutions:');
		Log.info(
			logOptions,
			'- Define using `--function-name` which function you want to use.',
		);
		Log.info(
			logOptions,
			`- Delete extraneous Lambda functions in your AWS console or using:`,
		);
		Log.info(
			logOptions,
			`    npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} $(npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND} -q) -y`,
		);
		Log.info(logOptions);
		Log.info(
			logOptions,
			`The following functions were found (only showing v${VERSION}):`,
		);
		for (const l of lambdasWithMatchingVersion) {
			Log.info(logOptions, `- ${l.functionName}`);
		}

		quit(1);
	}

	const {functionName} = lambdasWithMatchingVersion[0];

	return functionName;
};
