import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';
import {sitesLsSubcommand, SITES_LS_SUBCOMMAND} from './ls';

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
	CliInternals.Log.info();
	CliInternals.Log.info(
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Lists the sites currently deployed')
	);
};

// TODO: Add RM, RMALL subcommands

export const sitesCommand = (args: string[], remotionRoot: string) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand();
	}

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
