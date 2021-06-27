import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {sitesLsSubcommand, SITES_LS_SUBCOMMAND} from './ls';

export const SITES_COMMAND = 'sites';

export const printSitesHelp = () => {
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Lists the sites currently deployed'));
};

export const sitesCommand = (args: string[]) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printSitesHelp();
		process.exit(1);
	}

	printSitesHelp();
};
