import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import type {ServiceInfo} from '../../../api/get-service-info';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {CLOUD_RUN_DEPLOY_SUBCOMMAND, cloudRunDeploySubcommand} from './deploy';
import {SERVICES_LS_SUBCOMMAND, servicesLsCommand} from './ls';
import {SERVICES_RM_SUBCOMMAND, servicesRmCommand} from './rm';
import {SERVICES_RMALL_SUBCOMMAND, servicesRmallCommand} from './rmall';

export const SERVICES_COMMAND = 'services';

export const LEFT_COL = 20;

export const displayServiceInfo = (service: ServiceInfo) => {
	return [
		'Service name: '.padEnd(LEFT_COL, ' ') + ' ' + service.serviceName,
		'Version: '.padEnd(LEFT_COL, ' ') + ' ' + service.remotionVersion,
		'CPU Limit: '.padEnd(LEFT_COL, ' ') + ' ' + service.cpuLimit,
		'Memory Limit: '.padEnd(LEFT_COL, ' ') + ' ' + service.memoryLimit,
		'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + service.timeoutInSeconds + 'sec',
		'Region: '.padEnd(LEFT_COL, ' ') + ' ' + service.region,
		'Service URL: '.padEnd(LEFT_COL, ' ') + ' ' + service.uri,
		'GCP Console URL: '.padEnd(LEFT_COL, ' ') + ' ' + service.consoleUrl,
	].join('\n');
};

const printCloudRunHelp = (logLevel: LogLevel) => {
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SERVICES_COMMAND} <subcommand>`,
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available subcommands:');
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SERVICES_COMMAND} ${SERVICES_LS_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Lists the services currently deployed'),
	);
	Log.info({indent: false, logLevel}, '');
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SERVICES_COMMAND} ${CLOUD_RUN_DEPLOY_SUBCOMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Deploy a new Cloud Run service'),
	);
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SERVICES_COMMAND} ${SERVICES_RM_SUBCOMMAND} <service-name>`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete a Cloud Run service'),
	);
	CliInternals.Log.info({indent: false, logLevel}, '');
	CliInternals.Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${SERVICES_COMMAND} ${SERVICES_RMALL_SUBCOMMAND}`,
	);
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Delete all services in selected region'),
	);
};

export const servicesCommand = (args: string[], logLevel: LogLevel) => {
	if (args[0] === SERVICES_LS_SUBCOMMAND) {
		return servicesLsCommand(logLevel);
	}

	if (args[0] === SERVICES_RM_SUBCOMMAND) {
		return servicesRmCommand(args.slice(1), logLevel);
	}

	if (args[0] === SERVICES_RMALL_SUBCOMMAND) {
		return servicesRmallCommand(logLevel);
	}

	if (args[0] === CLOUD_RUN_DEPLOY_SUBCOMMAND) {
		return cloudRunDeploySubcommand(logLevel);
	}

	if (args[0]) {
		Log.error({indent: false, logLevel}, `Subcommand ${args[0]} not found.`);
		printCloudRunHelp(logLevel);
		quit(1);
	}

	printCloudRunHelp(logLevel);
};
