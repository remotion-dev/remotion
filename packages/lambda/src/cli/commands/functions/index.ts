import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {functionsDeploySubcommand, FUNCTIONS_DEPLOY_SUBCOMMAND} from './deploy';
import {functionsLsCommand, FUNCTIONS_LS_SUBCOMMAND} from './ls';
import {functionsRmCommand, FUNCTIONS_RM_SUBCOMMAND} from './rm';
import {functionsRmallCommand, FUNCTIONS_RMALL_SUBCOMMAND} from './rmall';

export const FUNCTIONS_COMMAND = 'functions';

const printFunctionsHelp = () => {
	CliInternals.Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND} <subcommand>`);
	CliInternals.Log.info();
	CliInternals.Log.info('Available subcommands:');
	CliInternals.Log.info('');
	CliInternals.Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Lists the functions currently deployed'),
	);
	CliInternals.Log.info('');
	CliInternals.Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Deploy a new Lambda function'),
	);
	CliInternals.Log.info('');
	CliInternals.Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} <function-name>`,
	);
	CliInternals.Log.info(CliInternals.chalk.gray('Delete a Lambda function'));
	CliInternals.Log.info('');
	CliInternals.Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RMALL_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
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
		return functionsDeploySubcommand();
	}

	if (args[0]) {
		CliInternals.Log.errorAdvanced(
			{indent: false, logLevel},
			`Subcommand ${args[0]} not found.`,
		);
		printFunctionsHelp();
		quit(1);
	}

	printFunctionsHelp();
};
