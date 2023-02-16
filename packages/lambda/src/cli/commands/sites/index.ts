import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';
import {sitesLsSubcommand, SITES_LS_SUBCOMMAND} from './ls';
import {sitesRmSubcommand, SITES_RM_COMMAND} from './rm';
import {sitesRmallSubcommand, SITES_RMALL_COMMAND} from './rmall';

export const SITES_COMMAND = 'sites';

const printSitesHelp = () => {
	CliInternals.Log.info(`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`);
	CliInternals.Log.info();
	CliInternals.Log.info('Available subcommands:');
	CliInternals.Log.info();
	CliInternals.Log.info(
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND} <entry-point>`
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Creates a new site based on a Remotion project')
	);
	CliInternals.Log.info();
	CliInternals.Log.info(
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Lists the sites currently deployed')
	);
	CliInternals.Log.info();
	CliInternals.Log.info(
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RM_COMMAND} <site-id>`
	);
	CliInternals.Log.info(
		CliInternals.chalk.gray('Remove a site from the S3 bucket.')
	);
};

export const sitesCommand = (args: string[], remotionRoot: string) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand();
	}

	if (args[0] === SITES_RM_COMMAND) {
		return sitesRmSubcommand(args.slice(1));
	}

	if (args[0] === SITES_RMALL_COMMAND) {
		return sitesRmallSubcommand();
	}

	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(args.slice(1), remotionRoot);
	}

	if (args[0]) {
		CliInternals.Log.error(`Subcommand ${args[0]} not found.`);
		printSitesHelp();
		quit(1);
	}

	printSitesHelp();
};
