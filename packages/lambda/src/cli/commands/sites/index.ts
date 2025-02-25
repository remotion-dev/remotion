import {CliInternals} from '@remotion/cli';
import {AwsProvider} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import type {ProviderSpecifics} from '@remotion/serverless';
import {quit} from '../../helpers/quit';
import {SITES_CREATE_SUBCOMMAND, sitesCreateSubcommand} from './create';
import {SITES_LS_SUBCOMMAND, sitesLsSubcommand} from './ls';
import {SITES_RM_COMMAND, sitesRmSubcommand} from './rm';
import {SITES_RMALL_COMMAND, sitesRmallSubcommand} from './rmall';

export const SITES_COMMAND = 'sites';

const printSitesHelp = (logLevel: LogLevel) => {
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`,
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info({indent: false, logLevel}, 'Available subcommands:');
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND} <entry-point>`,
	);
	CliInternals.Log.info(
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
		CliInternals.chalk.gray('Remove a site from the S3 bucket.'),
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RMALL_COMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Remove all sites from the S3 bucket.'),
	);
};

export const sitesCommand = (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
	providerSpecifics: ProviderSpecifics<AwsProvider>,
) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand(logLevel);
	}

	if (args[0] === SITES_RM_COMMAND) {
		return sitesRmSubcommand(args.slice(1), logLevel, providerSpecifics);
	}

	if (args[0] === SITES_RMALL_COMMAND) {
		return sitesRmallSubcommand(logLevel, providerSpecifics);
	}

	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(
			args.slice(1),
			remotionRoot,
			logLevel,
			providerSpecifics,
		);
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
