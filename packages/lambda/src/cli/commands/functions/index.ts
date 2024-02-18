import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {functionsDeploySubcommand, FUNCTIONS_DEPLOY_SUBCOMMAND} from './deploy';
import {functionsLsCommand, FUNCTIONS_LS_SUBCOMMAND} from './ls';
import {functionsRmCommand, FUNCTIONS_RM_SUBCOMMAND} from './rm';
import {functionsRmallCommand, FUNCTIONS_RMALL_SUBCOMMAND} from './rmall';

export const FUNCTIONS_COMMAND = 'functions';

const printFunctionsHelp = (logLevel: LogLevel) => {
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} <subcommand>`,
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		'Available subcommands:',
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel}, '');
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Lists the functions currently deployed'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel}, '');
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Deploy a new Lambda function'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel}, '');
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} <function-name>`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete a Lambda function'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel}, '');
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RMALL_SUBCOMMAND}`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete all functions in selected region'),
	);
};

export const functionsCommand = (args: string[], logLevel: LogLevel) => {
	if (args[0] === FUNCTIONS_LS_SUBCOMMAND) {
		return functionsLsCommand(logLevel);
	}

	if (args[0] === FUNCTIONS_RM_SUBCOMMAND) {
		return functionsRmCommand(args.slice(1), logLevel);
	}

	if (args[0] === FUNCTIONS_RMALL_SUBCOMMAND) {
		return functionsRmallCommand(logLevel);
	}

	if (args[0] === FUNCTIONS_DEPLOY_SUBCOMMAND) {
		return functionsDeploySubcommand(logLevel);
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
