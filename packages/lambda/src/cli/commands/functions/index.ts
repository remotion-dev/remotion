import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {FullClientSpecifics, ProviderSpecifics} from '@remotion/serverless';
import {AwsProvider} from '../../../client';
import {quit} from '../../helpers/quit';
import {FUNCTIONS_DEPLOY_SUBCOMMAND, functionsDeploySubcommand} from './deploy';
import {FUNCTIONS_LS_SUBCOMMAND, functionsLsCommand} from './ls';
import {FUNCTIONS_RM_SUBCOMMAND, functionsRmCommand} from './rm';
import {FUNCTIONS_RMALL_SUBCOMMAND, functionsRmallCommand} from './rmall';

export const FUNCTIONS_COMMAND = 'functions';

const printFunctionsHelp = (logLevel: LogLevel) => {
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} <subcommand>`,
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info({indent: false, logLevel}, 'Available subcommands:');
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Lists the functions currently deployed'),
	);
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Deploy a new Lambda function'),
	);
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} <function-name>`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete a Lambda function'),
	);
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RMALL_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete all functions in selected region'),
	);
};

export const functionsCommand = ({
	args,
	logLevel,
	fullClientSpecifics,
	providerSpecifics,
}: {
	args: string[];
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
	fullClientSpecifics: FullClientSpecifics<AwsProvider>;
}) => {
	if (args[0] === FUNCTIONS_LS_SUBCOMMAND) {
		return functionsLsCommand({logLevel, providerSpecifics});
	}

	if (args[0] === FUNCTIONS_RM_SUBCOMMAND) {
		return functionsRmCommand(args.slice(1), logLevel);
	}

	if (args[0] === FUNCTIONS_RMALL_SUBCOMMAND) {
		return functionsRmallCommand({logLevel, providerSpecifics});
	}

	if (args[0] === FUNCTIONS_DEPLOY_SUBCOMMAND) {
		return functionsDeploySubcommand({
			logLevel,
			fullClientSpecifics,
			providerSpecifics,
		});
	}

	if (args[0]) {
		CliInternals.Log.error(
			{indent: false, logLevel},
			`Subcommand ${args[0]} not found.`,
		);
		printFunctionsHelp(logLevel);
		quit(1);
	}

	printFunctionsHelp(logLevel);
};
