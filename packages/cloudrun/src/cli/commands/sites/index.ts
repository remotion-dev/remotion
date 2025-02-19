import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import type {Site} from '../../../api/get-sites';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {SITES_CREATE_SUBCOMMAND, sitesCreateSubcommand} from './create';
import {SITES_LS_SUBCOMMAND, sitesLsSubcommand} from './ls';
import {SITES_RM_COMMAND, sitesRmSubcommand} from './rm';
import {SITES_RMALL_COMMAND, sitesRmallSubcommand} from './rmall';

export const SITES_COMMAND = 'sites';

export const displaySiteInfo = (site: Site) => {
	return [
		'Site: '.padEnd(CliInternals.LABEL_WIDTH, ' ') + ' ' + site.id,
		'Bucket: '.padEnd(CliInternals.LABEL_WIDTH, ' ') + ' ' + site.bucketName,
		'Region: '.padEnd(CliInternals.LABEL_WIDTH, ' ') + ' ' + site.bucketRegion,
		'Serve Url: '.padEnd(CliInternals.LABEL_WIDTH, ' ') + ' ' + site.serveUrl,
	].join('\n');
};

const printSitesHelp = (logLevel: LogLevel) => {
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`,
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available subcommands:');
	Log.info({indent: false, logLevel}, '');
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Creates a new site based on a Remotion project'),
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Lists the sites currently deployed'),
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RM_COMMAND} <site-id>`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Remove a site from the Cloud Storage bucket.'),
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RMALL_COMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Remove all sites from the Cloud Storage bucket.'),
	);
};

export const sitesCommand = (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand(logLevel);
	}

	if (args[0] === SITES_RM_COMMAND) {
		return sitesRmSubcommand(args.slice(1), logLevel);
	}

	if (args[0] === SITES_RMALL_COMMAND) {
		return sitesRmallSubcommand(logLevel);
	}

	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(args.slice(1), remotionRoot, logLevel);
	}

	if (args[0]) {
		Log.error({indent: false, logLevel}, `Subcommand ${args[0]} not found.`);
		printSitesHelp(logLevel);
		quit(1);
	}

	printSitesHelp(logLevel);
};
