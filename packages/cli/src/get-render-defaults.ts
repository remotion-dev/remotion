import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderDefaults} from '@remotion/studio-shared';
import {ConfigInternals} from './config';
import type {ParsedCommandLine} from './parsed-cli';
import {parsedCli} from './parsed-cli';

const {
	x264Option,
	audioBitrateOption,
	offthreadVideoCacheSizeInBytesOption,
	concurrencyOption,
	offthreadVideoThreadsOption,
	scaleOption,
	jpegQualityOption,
	videoBitrateOption,
	enforceAudioOption,
	mutedOption,
	colorSpaceOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	numberOfGifLoopsOption,
	beepOnFinishOption,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	reproOption,
	logLevelOption,
	delayRenderTimeoutInMillisecondsOption,
	headlessOption,
	forSeamlessAacConcatenationOption,
	audioCodecOption,
	hardwareAccelerationOption,
	chromeModeOption,
	mediaCacheSizeInBytesOption,
	darkModeOption,
	pixelFormatOption,
	everyNthFrameOption,
	proResProfileOption,
	userAgentOption,
	disableWebSecurityOption,
	ignoreCertificateErrorsOption,
	publicLicenseKeyOption,
	stillImageFormatOption,
	videoImageFormatOption,
} = BrowserSafeApis.options;

export const getRenderDefaults = (
	commandLine: ParsedCommandLine = parsedCli,
): RenderDefaults => {
	const defaultJpegQuality = jpegQualityOption.getValue({
		commandLine,
	}).value;
	const logLevel = logLevelOption.getValue({commandLine}).value;
	const defaultCodec = ConfigInternals.getOutputCodecOrUndefined();
	const concurrency = RenderInternals.resolveConcurrency(
		concurrencyOption.getValue({commandLine}).value,
	);
	const pixelFormat = pixelFormatOption.getValue({
		commandLine,
	}).value;
	const proResProfile =
		proResProfileOption.getValue({commandLine}).value ?? null;

	const x264Preset = x264Option.getValue({
		commandLine,
	}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine,
		}).value;
	const offthreadVideoThreads = offthreadVideoThreadsOption.getValue({
		commandLine,
	}).value;
	const defaultScale = scaleOption.getValue({
		commandLine,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine,
	}).value;
	const enforceAudioTrack = enforceAudioOption.getValue({
		commandLine,
	}).value;
	const muted = mutedOption.getValue({
		commandLine,
	}).value;
	const colorSpace = colorSpaceOption.getValue({
		commandLine,
	}).value;
	const multiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine,
	}).value;
	const gl = glOption.getValue({
		commandLine,
	}).value;
	const numberOfGifLoops = numberOfGifLoopsOption.getValue({
		commandLine,
	}).value;
	const beepOnFinish = beepOnFinishOption.getValue({
		commandLine,
	}).value;
	const encodingMaxRate = encodingMaxRateOption.getValue({
		commandLine,
	}).value;
	const encodingBufferSize = encodingBufferSizeOption.getValue({
		commandLine,
	}).value;
	const repro = reproOption.getValue({
		commandLine,
	}).value;
	const delayRenderTimeout = delayRenderTimeoutInMillisecondsOption.getValue({
		commandLine,
	}).value;
	const headless = headlessOption.getValue({
		commandLine,
	}).value;
	const forSeamlessAacConcatenation =
		forSeamlessAacConcatenationOption.getValue({
			commandLine,
		}).value;
	const audioCodec = audioCodecOption.getValue({
		commandLine,
	}).value;
	const hardwareAcceleration = hardwareAccelerationOption.getValue({
		commandLine,
	}).value;
	const chromeMode = chromeModeOption.getValue({
		commandLine,
	}).value;
	const mediaCacheSizeInBytes = mediaCacheSizeInBytesOption.getValue({
		commandLine,
	}).value;
	const publicLicenseKey = publicLicenseKeyOption.getValue({
		commandLine,
	}).value;

	const everyNthFrame = everyNthFrameOption.getValue({
		commandLine,
	}).value;
	const stillImageFormat = stillImageFormatOption.getValue({
		commandLine,
	}).value;
	const videoImageFormat = videoImageFormatOption.getValue({
		commandLine,
	}).value;
	const disableWebSecurity = disableWebSecurityOption.getValue({
		commandLine,
	}).value;
	const ignoreCertificateErrors = ignoreCertificateErrorsOption.getValue({
		commandLine,
	}).value;
	const darkMode = darkModeOption.getValue({
		commandLine,
	}).value;
	const userAgent = userAgentOption.getValue({commandLine}).value;
	const metadata = ConfigInternals.getMetadata();
	const outputLocation = ConfigInternals.getOutputLocation();

	const maxConcurrency = RenderInternals.getMaxConcurrency();
	const minConcurrency = RenderInternals.getMinConcurrency();

	return {
		darkMode,
		jpegQuality: defaultJpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		scale: defaultScale ?? 1,
		logLevel,
		codec: defaultCodec ?? 'h264',
		concurrency,
		maxConcurrency,
		minConcurrency,
		stillImageFormat:
			stillImageFormat ?? RenderInternals.DEFAULT_STILL_IMAGE_FORMAT,
		videoImageFormat:
			videoImageFormat ?? RenderInternals.DEFAULT_VIDEO_IMAGE_FORMAT,
		muted,
		enforceAudioTrack,
		proResProfile,
		x264Preset: x264Preset ?? 'medium',
		pixelFormat,
		audioBitrate,
		videoBitrate,
		encodingBufferSize,
		encodingMaxRate,
		everyNthFrame,
		delayRenderTimeout,
		audioCodec,
		disableWebSecurity,
		headless,
		ignoreCertificateErrors,
		openGlRenderer: gl,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		colorSpace,
		multiProcessOnLinux,
		userAgent,
		repro,
		numberOfGifLoops,
		beepOnFinish,
		forSeamlessAacConcatenation,
		metadata,
		hardwareAcceleration,
		chromeMode,
		mediaCacheSizeInBytes,
		publicLicenseKey,
		outputLocation,
	};
};
