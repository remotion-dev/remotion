import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';
import {sitesLsSubcommand, SITES_LS_SUBCOMMAND} from './ls';
import {sitesRmSubcommand, SITES_RM_COMMAND} from './rm';
import {sitesRmallSubcommand, SITES_RMALL_COMMAND} from './rmall';

export const SITES_COMMAND = 'sites';

const printSitesHelp = (logLevel: LogLevel) => {
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`,
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		'Available subcommands:',
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND} <entry-point>`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Creates a new site based on a Remotion project'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Lists the sites currently deployed'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RM_COMMAND} <site-id>`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Remove a site from the S3 bucket.'),
	);
	CliInternals.Log.infoAdvanced({indent: false, logLevel});
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RMALL_COMMAND}`,
	);
	CliInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Remove all sites from the S3 bucket.'),
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
		CliInternals.Log.error(
			{indent: false, logLevel},
			`Subcommand ${args[0]} not found.`,
		);
		printSitesHelp(logLevel);
		quit(1);
	}

	printSitesHelp(logLevel);
};
