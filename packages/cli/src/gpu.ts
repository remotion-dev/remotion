import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {chalk} from './chalk';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const GPU_COMMAND = 'gpu';

export const gpuCommand = async (remotionRoot: string, logLevel: LogLevel) => {
	const {
		browserExecutable,
		puppeteerTimeout,
		disableWebSecurity,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	} = getCliOptions({
		isLambda: false,
		remotionRoot,
		type: 'get-compositions',
		logLevel,
	});

	const enableMultiProcessOnLinux =
		BrowserSafeApis.options.enableMultiprocessOnLinuxOption.getValue({
			commandLine: parsedCli,
		}).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	const statuses = await RenderInternals.getChromiumGpuInformation({
		browserExecutable,
		indent: false,
		logLevel,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
	});
	for (const {feature, status} of statuses) {
		Log.info(`${feature}: ${colorStatus(status)}`);
	}
};

const colorStatus = (status: string) => {
	if (status === 'Enabled') {
		return chalk.green(status);
	}

	if (status === 'Hardware accelerated') {
		return chalk.green(status);
	}

	if (status === 'Disabled') {
		return chalk.red(status);
	}

	if (status === 'Software only. Hardware acceleration disabled') {
		return chalk.red(status);
	}

	if (status === 'Software only, hardware acceleration unavailable') {
		return chalk.red(status);
	}

	return status;
};
