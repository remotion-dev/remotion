import {CliInternals} from '@remotion/cli';
import {
	AwsProvider,
	getCompositionsOnLambda,
	LambdaClientInternals,
} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {ProviderSpecifics} from '@remotion/serverless';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const COMPOSITIONS_COMMAND = 'compositions';

const {
	enableMultiprocessOnLinuxOption,
	glOption,
	delayRenderTimeoutInMillisecondsOption,
	headlessOption,
} = BrowserSafeApis.options;

export const compositionsCommand = async ({
	args,
	logLevel,
	providerSpecifics,
}: {
	args: string[];
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.error({indent: false, logLevel}, 'No serve URL passed.');
		Log.info(
			{indent: false, logLevel},
			'Pass an additional argument specifying a URL where your Remotion project is hosted.',
		);
		Log.info({indent: false, logLevel});
		Log.info(
			{indent: false, logLevel},
			`${BINARY_NAME} ${COMPOSITIONS_COMMAND} <serve-url>`,
		);
		quit(1);
	}

	const {
		envVariables,
		inputProps,
		ignoreCertificateErrors,
		userAgent,
		disableWebSecurity,
	} = CliInternals.getCliOptions({
		isStill: false,
		logLevel,
		indent: false,
	});

	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: CliInternals.parsedCli}).value;
	const puppeteerTimeout = delayRenderTimeoutInMillisecondsOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const headless = headlessOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	const region = getAwsRegion();
	LambdaClientInternals.validateServeUrl(serveUrl);
	const functionName = await findFunctionName({logLevel, providerSpecifics});

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

	CliInternals.printCompositions(comps, logLevel);
};
