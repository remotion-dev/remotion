import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {INCREASE_SUBCOMMAND, quotasIncreaseCommand} from './increase';
import {quotasListCommand} from './list';
export const QUOTAS_COMMAND = 'quotas';

const printHelp = (logLevel: LogLevel) => {
	CliInternals.Log.info({indent: false, logLevel}, 'Available commands:');
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`npx ${BINARY_NAME} ${QUOTAS_COMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('List relevant AWS Lambda quotas.'),
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Increase Lambda quotas.'),
	);
};

export const quotasCommand = (args: string[], logLevel: LogLevel) => {
	if (args.filter(Boolean).length === 0) {
		return quotasListCommand(logLevel);
	}

	if (args[0] === INCREASE_SUBCOMMAND) {
		return quotasIncreaseCommand(logLevel);
	}

	CliInternals.Log.error(
		{indent: false, logLevel},
		'Subcommand ' + args[0] + ' not found.',
	);
	printHelp(logLevel);
};
