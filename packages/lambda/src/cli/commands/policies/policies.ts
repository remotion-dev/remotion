import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {ROLE_SUBCOMMAND, roleSubcommand} from './role';
import {USER_SUBCOMMAND, userSubcommand} from './user';
import {VALIDATE_SUBCOMMAND, validateSubcommand} from './validate';

export const POLICIES_COMMAND = 'policies';

const printPoliciesHelp = (logLevel: LogLevel) => {
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${POLICIES_COMMAND} <subcommand>`,
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available subcommands:');
	Log.info({indent: false, logLevel}, '');
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${POLICIES_COMMAND} ${USER_SUBCOMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the user that is attached to the access token.',
		),
	);
	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${POLICIES_COMMAND} ${ROLE_SUBCOMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the role that is attached to the lambda function.',
		),
	);
	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${POLICIES_COMMAND} ${VALIDATE_SUBCOMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'Validate the current policies setup is correct by running tests using the AWS policy simulator.',
		),
	);
};

export const policiesCommand = (args: string[], logLevel: LogLevel) => {
	if (args[0] === USER_SUBCOMMAND) {
		return userSubcommand(logLevel);
	}

	if (args[0] === ROLE_SUBCOMMAND) {
		return roleSubcommand(logLevel);
	}

	if (args[0] === VALIDATE_SUBCOMMAND) {
		return validateSubcommand(logLevel);
	}

	if (args[0]) {
		Log.error({indent: false, logLevel}, `Subcommand ${args[0]} not found.`);
		printPoliciesHelp(logLevel);
		quit(1);
	}

	printPoliciesHelp(logLevel);
};
