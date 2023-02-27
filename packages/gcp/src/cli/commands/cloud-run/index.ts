import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {cloudRunDeploySubcommand, CLOUD_RUN_DEPLOY_SUBCOMMAND} from './deploy';

export const CLOUD_RUN_COMMAND = 'cloud-run';

const printCloudRunHelp = () => {
	Log.info(`${BINARY_NAME} ${CLOUD_RUN_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(
		`${BINARY_NAME} ${CLOUD_RUN_COMMAND} ${CLOUD_RUN_DEPLOY_SUBCOMMAND}`
	);
	Log.info(CliInternals.chalk.gray('Deploy a new Cloud Run service'));
};

// TODO: Add LS, RM, RMALL subcommands

export const cloudRunCommand = (args: string[]) => {
	if (args[0] === CLOUD_RUN_DEPLOY_SUBCOMMAND) {
		return cloudRunDeploySubcommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printCloudRunHelp();
		quit(1);
	}

	printCloudRunHelp();
};
