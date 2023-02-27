import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';

export const SITES_COMMAND = 'sites';

const printSitesHelp = () => {
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray('Creates a new site based on a Remotion project')
	);
};

// TODO: Add LS, RM, RMALL subcommands

export const sitesCommand = (args: string[], remotionRoot: string) => {
	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(args.slice(1), remotionRoot);
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printSitesHelp();
		quit(1);
	}

	printSitesHelp();
};
