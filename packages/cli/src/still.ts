import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {registerCleanupJob} from './cleanup-before-quit';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli} from './parsed-cli';
import {renderStillFlow} from './render-flows/still';

const {
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	jpegQualityOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	delayRenderTimeoutInMillisecondsOption,
	headlessOption,
	overwriteOption,
	binariesDirectoryOption,
	publicPathOption,
	publicDirOption,
	chromeModeOption,
	offthreadVideoThreadsOption,
	audioLatencyHintOption,
	mediaCacheSizeInBytesOption,
	darkModeOption,
	askAIOption,
	experimentalClientSideRenderingOption,
	experimentalVisualModeOption,
	keyboardShortcutsOption,
	rspackOption,
	browserExecutableOption,
	userAgentOption,
	disableWebSecurityOption,
	ignoreCertificateErrorsOption,
	overrideHeightOption,
	overrideWidthOption,
	overrideFpsOption,
	overrideDurationOption,
	bundleCacheOption,
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
	} = findEntryPoint({args, remotionRoot, logLevel, allowDirectory: true});

	if (!file) {
		Log.error(
			{indent: false, logLevel},
			'No entry point specified. Pass more arguments:',
		);
		Log.error(
			{indent: false, logLevel},
			'   npx remotion render [entry-point] [composition-name] [out-name]',
		);
		Log.error(
			{indent: false, logLevel},
			'Documentation: https://www.remotion.dev/docs/render',
		);
		process.exit(1);
	}

	const fullEntryPoint = convertEntryPointToServeUrl(file);

	if (parsedCli.frames) {
		Log.error(
			{indent: false, logLevel},
			'--frames flag was passed to the `still` command. This flag only works with the `render` command. Did you mean `--frame`? See reference: https://www.remotion.dev/docs/cli/',
		);
		process.exit(1);
	}

	const {envVariables, inputProps, stillFrame} = getCliOptions({
		isStill: true,
		logLevel,
		indent: false,
	});

	const height = overrideHeightOption.getValue({
		commandLine: parsedCli,
	}).value;
	const width = overrideWidthOption.getValue({
		commandLine: parsedCli,
	}).value;
	const fps = overrideFpsOption.getValue({commandLine: parsedCli}).value;
	const durationInFrames = overrideDurationOption.getValue({
		commandLine: parsedCli,
	}).value;

	const browserExecutable = browserExecutableOption.getValue({
		commandLine: parsedCli,
	}).value;
	const userAgent = userAgentOption.getValue({commandLine: parsedCli}).value;
	const disableWebSecurity = disableWebSecurityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const ignoreCertificateErrors = ignoreCertificateErrorsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const scale = scaleOption.getValue({commandLine: parsedCli}).value;
	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: parsedCli}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const mediaCacheSizeInBytes = mediaCacheSizeInBytesOption.getValue({
		commandLine: parsedCli,
	}).value;
	const offthreadVideoThreads = offthreadVideoThreadsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const puppeteerTimeout = delayRenderTimeoutInMillisecondsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const headless = headlessOption.getValue({
		commandLine: parsedCli,
	}).value;
	const overwrite = overwriteOption.getValue(
		{
			commandLine: parsedCli,
		},
		true,
	).value;
	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;
	const publicPath = publicPathOption.getValue({
		commandLine: parsedCli,
	}).value;
	const publicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;
	const chromeMode = chromeModeOption.getValue({
		commandLine: parsedCli,
	}).value;
	const audioLatencyHint = audioLatencyHintOption.getValue({
		commandLine: parsedCli,
	}).value;
	const darkMode = darkModeOption.getValue({commandLine: parsedCli}).value;
	const askAIEnabled = askAIOption.getValue({commandLine: parsedCli}).value;
	const keyboardShortcutsEnabled = keyboardShortcutsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const rspack = rspackOption.getValue({commandLine: parsedCli}).value;
	const shouldCache = bundleCacheOption.getValue({
		commandLine: parsedCli,
	}).value;

	const chromiumOptions: Required<ChromiumOptions> = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
		darkMode,
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
		width,
		fps,
		durationInFrames,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithSpecialTypes({
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
		compositionIdFromUi: null,
		imageFormatFromUi: null,
		logLevel,
		onProgress: () => undefined,
		indent: false,
		addCleanupCallback: (label, c) => {
			registerCleanupJob(label, c);
		},
		cancelSignal: null,
		outputLocationFromUi: null,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		binariesDirectory,
		publicPath,
		chromeMode,
		audioLatencyHint,
		mediaCacheSizeInBytes,
		askAIEnabled,
		experimentalClientSideRenderingEnabled:
			experimentalClientSideRenderingOption.getValue({commandLine: parsedCli})
				.value,
		experimentalVisualModeEnabled: experimentalVisualModeOption.getValue({
			commandLine: parsedCli,
		}).value,
		keyboardShortcutsEnabled,
		rspack,
		shouldCache,
	});
};
