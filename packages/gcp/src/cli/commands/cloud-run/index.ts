import {Log} from '@remotion/cli/dist/log';
import {quit} from '../../helpers/quit';
import {cloudRunDeploySubcommand, CLOUD_RUN_DEPLOY_SUBCOMMAND} from './deploy';

export const CLOUD_RUN_COMMAND = 'cloud-run';

const printCloudRunHelp = () => {
	// TODO: Add help text
};

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
