import {CliInternals} from '@remotion/cli';
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {getCompositionsOnLambda} from '../../..';
import {BINARY_NAME} from '../../../shared/constants';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const COMPOSITIONS_COMMAND = 'compositions';

const {enableMultiprocessOnLinuxOption, glOption} = BrowserSafeApis.options;

export const compositionsCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.errorAdvanced({indent: false, logLevel}, 'No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.',
		);
		Log.info();
		Log.info(`${BINARY_NAME} ${COMPOSITIONS_COMMAND} <serve-url>`);
		quit(1);
	}

	const {
		envVariables,
		inputProps,
		puppeteerTimeout,
		headless,
		ignoreCertificateErrors,
		userAgent,
		disableWebSecurity,
	} = CliInternals.getCliOptions({
		type: 'get-compositions',
		isLambda: true,
		remotionRoot,
		logLevel,
	});

	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: CliInternals.parsedCli}).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	const region = getAwsRegion();
	validateServeUrl(serveUrl);
	const functionName = await findFunctionName(logLevel);

	const comps = await getCompositionsOnLambda({
		functionName,
		serveUrl,
		inputProps,
		region,
		chromiumOptions,
		envVariables,
		logLevel,
		timeoutInMilliseconds: puppeteerTimeout,
		forceBucketName: parsedLambdaCli['force-bucket-name'],
	});

	CliInternals.printCompositions(comps);
};
