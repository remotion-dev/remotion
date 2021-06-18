import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../api/bundle-remotion';
import {simulatePermissions} from '../api/iam-validation/simulate';
import {
	getRolePolicy,
	getUserPolicy,
} from '../api/iam-validation/suggested-policy';
import {getAwsRegion} from './get-aws-region';
import {Log} from './log';

export const POLICIES_COMMAND = 'policies';

const USER_SUBCOMMAND = 'user';
const ROLE_SUBCOMMAND = 'role';
const VALIDATE_SUBCOMMAND = 'validate';

const printPoliciesHelp = () => {
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommandss:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${USER_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the user that is attached to the access token.'
		)
	);
	Log.info();
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${ROLE_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the role that is attached to the lambda function.'
		)
	);
	Log.info();
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${VALIDATE_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Validate the current policies setup is correct by running tests using the AWS policy simulator.'
		)
	);
};

const validateSubcommand = async () => {
	try {
		await simulatePermissions({region: getAwsRegion()});
	} catch (err) {
		Log.error('Did not have the required permissions on AWS:');
		Log.error(err);
	}
};

export const policiesCommand = (args: string[]) => {
	if (args[0] === USER_SUBCOMMAND) {
		Log.info('Policy for user:');
		Log.info(JSON.stringify(getUserPolicy(), null, 2));
		return;
	}

	if (args[0] === ROLE_SUBCOMMAND) {
		Log.info('Policy for role:');
		Log.info(JSON.stringify(getRolePolicy(), null, 2));
		return;
	}

	if (args[0] === VALIDATE_SUBCOMMAND) {
		return validateSubcommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printPoliciesHelp();
		process.exit(1);
	}

	printPoliciesHelp();
};
