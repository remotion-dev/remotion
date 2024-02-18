import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderDefaults} from '@remotion/studio';
import {ConfigInternals} from './config';
import {parsedCli} from './parse-command-line';

const {
	x264Option,
	audioBitrateOption,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	jpegQualityOption,
	videoBitrateOption,
	enforceAudioOption,
	mutedOption,
	colorSpaceOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	numberOfGifLoopsOption,
} = BrowserSafeApis.options;

export const getRenderDefaults = (): RenderDefaults => {
	const defaultJpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const logLevel = ConfigInternals.Logging.getLogLevel();
	const defaultCodec = ConfigInternals.getOutputCodecOrUndefined();
	const concurrency = RenderInternals.getActualConcurrency(
		ConfigInternals.getConcurrency(),
	);
	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = ConfigInternals.getProResProfile() ?? 'hq';

	const x264Preset = x264Option.getValue({
		commandLine: parsedCli,
	}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const defaultScale = scaleOption.getValue({
		commandLine: parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const enforceAudioTrack = enforceAudioOption.getValue({
		commandLine: parsedCli,
	}).value;
	const muted = mutedOption.getValue({
		commandLine: parsedCli,
	}).value;
	const colorSpace = colorSpaceOption.getValue({
		commandLine: parsedCli,
	}).value;
	const multiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({
		commandLine: parsedCli,
	}).value;
	const numberOfGifLoops = numberOfGifLoopsOption.getValue({
		commandLine: parsedCli,
	}).value;

	const encodingBufferSize = ConfigInternals.getEncodingBufferSize();
	const encodingMaxRate = ConfigInternals.getEncodingMaxRate();
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const delayRenderTimeout = ConfigInternals.getCurrentPuppeteerTimeout();
	const audioCodec = ConfigInternals.getAudioCodec();
	const stillImageFormat = ConfigInternals.getUserPreferredStillImageFormat();
	const videoImageFormat = ConfigInternals.getUserPreferredVideoImageFormat();
	const disableWebSecurity = ConfigInternals.getChromiumDisableWebSecurity();
	const beepOnFinish = ConfigInternals.getBeepOnFinish();
	const headless = ConfigInternals.getChromiumHeadlessMode();
	const ignoreCertificateErrors = ConfigInternals.getIgnoreCertificateErrors();
	const userAgent = ConfigInternals.getChromiumUserAgent();

	const maxConcurrency = RenderInternals.getMaxConcurrency();
	const minConcurrency = RenderInternals.getMinConcurrency();
	const repro = ConfigInternals.getRepro();

	return {
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
		colorSpace,
		multiProcessOnLinux,
		userAgent,
		beepOnFinish,
		repro,
		numberOfGifLoops,
	};
};
