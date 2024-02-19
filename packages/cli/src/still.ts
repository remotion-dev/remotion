import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {registerCleanupJob} from './cleanup-before-quit';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {renderStillFlow} from './render-flows/still';

const {
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	jpegQualityOption,
	enableMultiprocessOnLinuxOption,
	glOption,
} = BrowserSafeApis.options;

export const still = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {
		file,
		remainingArgs,
		reason: entryPointReason,
	} = findEntryPoint(args, remotionRoot, logLevel);

	if (!file) {
		Log.error('No entry point specified. Pass more arguments:');
		Log.error(
			'   npx remotion render [entry-point] [composition-name] [out-name]',
		);
		Log.error('Documentation: https://www.remotion.dev/docs/render');
		process.exit(1);
	}

	const fullEntryPoint = convertEntryPointToServeUrl(file);

	if (parsedCli.frames) {
		Log.error(
			'--frames flag was passed to the `still` command. This flag only works with the `render` command. Did you mean `--frame`? See reference: https://www.remotion.dev/docs/cli/',
		);
		process.exit(1);
	}

	const {
		browserExecutable,
		envVariables,
		height,
		inputProps,
		overwrite,
		publicDir,
		puppeteerTimeout,
		stillFrame,
		width,
		disableWebSecurity,
		headless,
		ignoreCertificateErrors,
		userAgent,
	} = getCliOptions({
		isLambda: false,
		type: 'still',
		remotionRoot,
		logLevel,
	});

	const jpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const scale = scaleOption.getValue({commandLine: parsedCli}).value;
	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: parsedCli}).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	await renderStillFlow({
		remotionRoot,
		entryPointReason,
		fullEntryPoint,
		remainingArgs,
		browser: 'chrome',
		browserExecutable,
		chromiumOptions,
		envVariables,
		height,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				indent: undefined,
				staticBase: null,
			}).serializedString,
		overwrite,
		port: getRendererPortFromConfigFileAndCliFlag(),
		publicDir,
		puppeteerTimeout,
		jpegQuality,
		scale,
		stillFrame,
		width,
		compositionIdFromUi: null,
		imageFormatFromUi: null,
		logLevel,
		onProgress: () => undefined,
		indent: false,
		addCleanupCallback: (c) => {
			registerCleanupJob(c);
		},
		cancelSignal: null,
		outputLocationFromUi: null,
		offthreadVideoCacheSizeInBytes:
			offthreadVideoCacheSizeInBytesOption.getValue({
				commandLine: parsedCli,
			}).value,
	});
};
