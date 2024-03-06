// eslint-disable-next-line no-restricted-imports
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {registerCleanupJob} from './cleanup-before-quit';
import {ConfigInternals} from './config';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {renderVideoFlow} from './render-flows/render';

const {
	x264Option,
	audioBitrateOption,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
	enforceAudioOption,
	mutedOption,
	colorSpaceOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	numberOfGifLoopsOption,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	reproOption,
	delayRenderTimeoutInMillisecondsOption,
	headlessOption,
	overwriteOption,
	binariesDirectoryOption,
	forSeamlessAacConcatenationOption,
	separateAudioOption,
} = BrowserSafeApis.options;

export const render = async (
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

	if (parsedCli.frame) {
		Log.error(
			{indent: false, logLevel},
			'--frame flag was passed to the `render` command. This flag only works with the `still` command. Did you mean `--frames`? See reference: https://www.remotion.dev/docs/cli/',
		);
		process.exit(1);
	}

	const {
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		inputProps,
		envVariables,
		browserExecutable,
		everyNthFrame,
		userAgent,
		disableWebSecurity,
		ignoreCertificateErrors,
		publicDir,
		height,
		width,
		ffmpegOverride,
		proResProfile,
		pixelFormat,
	} = getCliOptions({
		isStill: false,
		logLevel,
	});

	const x264Preset = x264Option.getValue({commandLine: parsedCli}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const scale = scaleOption.getValue({commandLine: parsedCli}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const enforceAudioTrack = enforceAudioOption.getValue({
		commandLine: parsedCli,
	}).value;
	const muted = mutedOption.getValue({commandLine: parsedCli}).value;
	const colorSpace = colorSpaceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const crf = shouldOutputImageSequence
		? null
		: crfOption.getValue({commandLine: parsedCli}).value;
	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: parsedCli}).value;
	const numberOfGifLoops = numberOfGifLoopsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const encodingMaxRate = encodingMaxRateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const encodingBufferSize = encodingBufferSizeOption.getValue({
		commandLine: parsedCli,
	}).value;
	const repro = reproOption.getValue({commandLine: parsedCli}).value;
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

	const forSeamlessAacConcatenation =
		forSeamlessAacConcatenationOption.getValue({
			commandLine: parsedCli,
		}).value;

	const separateAudioTo = separateAudioOption.getValue(
		{
			commandLine: parsedCli,
		},
		remotionRoot,
	).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	const audioCodec =
		parsedCli['audio-codec'] ?? ConfigInternals.getAudioCodec();

	await renderVideoFlow({
		fullEntryPoint,
		remotionRoot,
		browserExecutable,
		indent: false,
		logLevel,
		browser: 'chrome',
		chromiumOptions,
		scale,
		shouldOutputImageSequence,
		publicDir,
		envVariables,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: inputProps,
			}).serializedString,
		puppeteerTimeout,
		port: getRendererPortFromConfigFileAndCliFlag(),
		height,
		width,
		remainingArgs,
		compositionIdFromUi: null,
		entryPointReason,
		overwrite,
		quiet: quietFlagProvided(),
		concurrency,
		everyNthFrame,
		frameRange,
		jpegQuality,
		onProgress: () => undefined,
		addCleanupCallback: (c) => {
			registerCleanupJob(c);
		},
		outputLocationFromUI: null,
		uiCodec: null,
		uiImageFormat: null,
		cancelSignal: null,
		crf,
		ffmpegOverride,
		audioBitrate,
		muted,
		enforceAudioTrack,
		proResProfile,
		x264Preset,
		pixelFormat,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
		numberOfGifLoops,
		audioCodec,
		disallowParallelEncoding: false,
		offthreadVideoCacheSizeInBytes,
		colorSpace,
		repro,
		binariesDirectory,
		forSeamlessAacConcatenation,
		separateAudioTo,
	});
};
