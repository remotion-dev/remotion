import type {WebpackConfiguration} from '@remotion/bundler';
import type {
	Browser,
	BrowserExecutable,
	ChromeMode,
	ColorSpace,
	Crf,
	DeleteAfter,
	FfmpegOverrideFn,
	FrameRange,
	NumberOfGifLoops,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {
	getMaxTimelineTracks,
	setMaxTimelineTracks,
} from './max-timeline-tracks';

export type {WebpackConfiguration};

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

export type Concurrency = number | string | null;

const {
	benchmarkConcurrenciesOption,
	beepOnFinishOption,
	bundleCacheOption,
	browserExecutableOption,
	colorSpaceOption,
	concurrencyOption,
	crfOption,
	darkModeOption,
	delayRenderTimeoutInMillisecondsOption,
	deleteAfterOption,
	disableWebSecurityOption,
	disallowParallelEncodingOption,
	enableCrossSiteIsolationOption,
	enableLambdaInsights,
	enableMultiprocessOnLinuxOption,
	enforceAudioOption,
	envFileOption,
	everyNthFrameOption,
	folderExpiryOption,
	forSeamlessAacConcatenationOption,
	forceNewStudioOption,
	framesOption,
	glOption,
	hardwareAccelerationOption,
	headlessOption,
	imageSequenceOption,
	imageSequencePatternOption,
	ignoreCertificateErrorsOption,
	ipv4Option,
	jpegQualityOption,
	keyboardShortcutsOption,
	logLevelOption,
	mutedOption,
	noOpenOption,
	numberOfGifLoopsOption,
	numberOfSharedAudioTagsOption,
	offthreadVideoCacheSizeInBytesOption,
	outDirOption,
	overrideDurationOption,
	overrideFpsOption,
	overrideHeightOption,
	overrideWidthOption,
	pixelFormatOption,
	preferLosslessOption,
	proResProfileOption,
	publicDirOption,
	publicLicenseKeyOption,
	publicPathOption,
	reproOption,
	rspackOption,
	runsOption,
	scaleOption,
	stillImageFormatOption,
	userAgentOption,
	videoBitrateOption,
	videoCodecOption,
	videoImageFormatOption,
	webpackPollOption,
	x264Option,
	audioBitrateOption,
	audioCodecOption,
	audioLatencyHintOption,
	encodingBufferSizeOption,
	encodingMaxRateOption,
	askAIOption,
	mediaCacheSizeInBytesOption,
} = BrowserSafeApis.options;

const configCommandLine = {_: []} as {
	_: string[];
} & Record<string, unknown>;

const defaultOverrideFunction: WebpackOverrideFn = (config) => config;

let entryPoint: string | null = null;
let studioPort: number | undefined;
let rendererPort: number | undefined;
let ffmpegOverrideFn: FfmpegOverrideFn = ({args}) => args;
let currentOutputLocation: string | null = null;
let currentStillFrame = 0;
let specifiedMetadata: Record<string, string> | undefined;
let overrideFn: WebpackOverrideFn = defaultOverrideFunction;
let bufferStateDelayInMilliseconds: number | null = null;
let experimentalClientSideRenderingEnabled = false;
let experimentalVisualModeEnabled = false;

const getConfiguredValue = <T>(option: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getValue: (...args: any[]) => {value: T};
}): T => {
	return option.getValue({commandLine: configCommandLine}).value;
};

const validatePort = (port: number | undefined) => {
	if (!['number', 'undefined'].includes(typeof port)) {
		throw new Error(
			`Studio server port should be a number. Got ${typeof port} (${JSON.stringify(
				port,
			)})`,
		);
	}

	if (port === undefined) {
		return;
	}

	if (port < 1 || port > 65535) {
		throw new Error(
			`Studio server port should be a number between 1 and 65535. Got ${port}`,
		);
	}
};

const setStudioPort = (port: number | undefined) => {
	validatePort(port);
	studioPort = port;
};

const setRendererPort = (port: number | undefined) => {
	validatePort(port);
	rendererPort = port;
};

const setPort = (port: number | undefined) => {
	setStudioPort(port);
	setRendererPort(port);
};

const setEntryPoint = (src: string) => {
	entryPoint = src;
};

const setFfmpegOverrideFunction = (fn: FfmpegOverrideFn) => {
	ffmpegOverrideFn = fn;
};

const setMetadata = (metadata: Record<string, string>): void => {
	specifiedMetadata = metadata;
};

const setOutputLocation = (newOutputLocation: string) => {
	if (typeof newOutputLocation !== 'string') {
		throw new Error(
			`outputLocation must be a string but got ${typeof newOutputLocation} (${JSON.stringify(
				newOutputLocation,
			)})`,
		);
	}

	if (newOutputLocation.trim() === '') {
		throw new Error(`outputLocation must not be an empty string`);
	}

	currentOutputLocation = newOutputLocation;
};

const setStillFrame = (frame: number) => {
	NoReactInternals.validateFrame({
		frame,
		durationInFrames: Infinity,
		allowFloats: false,
	});
	currentStillFrame = frame;
};

const setBufferStateDelay = (delay: number | null) => {
	bufferStateDelayInMilliseconds = delay;
};

const setExperimentalClientSideRendering = (value: boolean) => {
	experimentalClientSideRenderingEnabled = value;
};

const setExperimentalVisualMode = (value: boolean) => {
	experimentalVisualModeEnabled = value;
};

const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	const previousOverride = overrideFn;
	overrideFn = async (config) => fn(await previousOverride(config));
};

export const Config = {
	get Bundling() {
		throw new Error(
			'The config format has changed. Change `Config.Bundling.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Rendering() {
		throw new Error(
			'The config format has changed. Change `Config.Rendering.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Output() {
		throw new Error(
			'The config format has changed. Change `Config.Output.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Log() {
		throw new Error(
			'The config format has changed. Change `Config.Log.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Preview() {
		throw new Error(
			'The config format has changed. Change `Config.Preview.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Puppeteer() {
		throw new Error(
			'The config format has changed. Change `Config.Puppeteer.*()` calls to `Config.*()` in your config file.',
		);
	},
	setMaxTimelineTracks,
	setKeyboardShortcutsEnabled: keyboardShortcutsOption.setConfig,
	setExperimentalClientSideRenderingEnabled: setExperimentalClientSideRendering,
	setExperimentalRspackEnabled: rspackOption.setConfig,
	setExperimentalVisualMode,
	setNumberOfSharedAudioTags: numberOfSharedAudioTagsOption.setConfig,
	setWebpackPollingInMilliseconds: webpackPollOption.setConfig,
	setShouldOpenBrowser: noOpenOption.setConfig,
	setBufferStateDelayInMilliseconds: setBufferStateDelay,
	overrideWebpackConfig,
	setCachingEnabled: bundleCacheOption.setConfig,
	setPort,
	setStudioPort,
	setRendererPort,
	setPublicDir: publicDirOption.setConfig,
	setEntryPoint,
	setLevel: logLevelOption.setConfig,
	setBrowserExecutable: browserExecutableOption.setConfig,
	setTimeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption.setConfig,
	setDelayRenderTimeoutInMilliseconds:
		delayRenderTimeoutInMillisecondsOption.setConfig,
	setChromiumDisableWebSecurity: disableWebSecurityOption.setConfig,
	setChromiumIgnoreCertificateErrors: ignoreCertificateErrorsOption.setConfig,
	setChromiumHeadlessMode: headlessOption.setConfig,
	setChromiumOpenGlRenderer: glOption.setConfig,
	setChromiumUserAgent: userAgentOption.setConfig,
	setDotEnvLocation: envFileOption.setConfig,
	setConcurrency: concurrencyOption.setConfig,
	setChromiumMultiProcessOnLinux: enableMultiprocessOnLinuxOption.setConfig,
	setChromiumDarkMode: darkModeOption.setConfig,
	setQuality: () => {
		throw new Error(
			'setQuality() has been renamed - use setJpegQuality() instead.',
		);
	},
	setImageFormat: () => {
		throw new Error(
			'Config.setImageFormat() has been renamed - use Config.setVideoImageFormat() instead (default "jpeg"). For rendering stills, use Config.setStillImageFormat() (default "png")',
		);
	},
	setJpegQuality: jpegQualityOption.setConfig,
	setStillImageFormat: stillImageFormatOption.setConfig,
	setVideoImageFormat: videoImageFormatOption.setConfig,
	setMetadata,
	setEncodingMaxRate: encodingMaxRateOption.setConfig,
	setEncodingBufferSize: encodingBufferSizeOption.setConfig,
	setFrameRange: framesOption.setConfig,
	setScale: scaleOption.setConfig,
	setEveryNthFrame: everyNthFrameOption.setConfig,
	setNumberOfGifLoops: numberOfGifLoopsOption.setConfig,
	setMuted: mutedOption.setConfig,
	setEnforceAudioTrack: enforceAudioOption.setConfig,
	setOutputLocation,
	setOverwriteOutput: BrowserSafeApis.options.overwriteOption.setConfig,
	setChromeMode: BrowserSafeApis.options.chromeModeOption.setConfig,
	setPixelFormat: pixelFormatOption.setConfig,
	setCodec: videoCodecOption.setConfig,
	setCrf: crfOption.setConfig,
	setImageSequence: imageSequenceOption.setConfig,
	setProResProfile: proResProfileOption.setConfig,
	setX264Preset: x264Option.setConfig,
	setAudioBitrate: audioBitrateOption.setConfig,
	setVideoBitrate: videoBitrateOption.setConfig,
	setAudioLatencyHint: audioLatencyHintOption.setConfig,
	setForSeamlessAacConcatenation: forSeamlessAacConcatenationOption.setConfig,
	overrideHeight: overrideHeightOption.setConfig,
	overrideWidth: overrideWidthOption.setConfig,
	overrideFps: overrideFpsOption.setConfig,
	overrideDuration: overrideDurationOption.setConfig,
	overrideFfmpegCommand: setFfmpegOverrideFunction,
	setAudioCodec: audioCodecOption.setConfig,
	setOffthreadVideoCacheSizeInBytes:
		offthreadVideoCacheSizeInBytesOption.setConfig,
	setDeleteAfter: deleteAfterOption.setConfig,
	setColorSpace: colorSpaceOption.setConfig,
	setDisallowParallelEncoding: disallowParallelEncodingOption.setConfig,
	setBeepOnFinish: beepOnFinishOption.setConfig,
	setEnableFolderExpiry: folderExpiryOption.setConfig,
	setRepro: reproOption.setConfig,
	setLambdaInsights: enableLambdaInsights.setConfig,
	setBinariesDirectory:
		BrowserSafeApis.options.binariesDirectoryOption.setConfig,
	setPreferLosslessAudio: preferLosslessOption.setConfig,
	setPublicPath: publicPathOption.setConfig,
	setImageSequencePattern: imageSequencePatternOption.setConfig,
	setHardwareAcceleration: hardwareAccelerationOption.setConfig,
	setEnableCrossSiteIsolation: enableCrossSiteIsolationOption.setConfig,
	setAskAIEnabled: askAIOption.setConfig,
	setPublicLicenseKey: publicLicenseKeyOption.setConfig,
	setForceNewStudioEnabled: forceNewStudioOption.setConfig,
	setIPv4: ipv4Option.setConfig,
	setBundleOutDir: outDirOption.setConfig,
	setBenchmarkRuns: runsOption.setConfig,
	setBenchmarkConcurrencies: benchmarkConcurrenciesOption.setConfig,
} as const;

export const ConfigInternals = {
	getBrowser: (): Browser | null => {
		return null;
	},
	getStudioPort: () => studioPort,
	getRendererPortFromConfigFile: () => rendererPort ?? null,
	getConcurrency: (): Concurrency => {
		return getConfiguredValue(concurrencyOption);
	},
	getStillFrame: () => currentStillFrame,
	getShouldOutputImageSequence: (frameRange: FrameRange | null) => {
		return (
			getConfiguredValue(imageSequenceOption) || typeof frameRange === 'number'
		);
	},
	getDotEnvLocation: (): string | null => {
		return getConfiguredValue(envFileOption);
	},
	getWebpackOverrideFn: () => overrideFn,
	getWebpackCaching: () => {
		return getConfiguredValue(bundleCacheOption);
	},
	getOutputLocation: () => currentOutputLocation,
	setStillFrame,
	getMaxTimelineTracks,
	defaultOverrideFunction,
	getFfmpegOverrideFunction: () => ffmpegOverrideFn,
	getMetadata: (): Record<string, string> => {
		return specifiedMetadata ?? {};
	},
	getEntryPoint: () => entryPoint,
	getWebpackPolling: () => {
		return getConfiguredValue(webpackPollOption);
	},
	getBufferStateDelayInMilliseconds: (): number | null => {
		return bufferStateDelayInMilliseconds;
	},
	getOutputCodecOrUndefined: BrowserSafeApis.getOutputCodecOrUndefined,
	getConfiguredLogLevel: () => getConfiguredValue(logLevelOption),
	getConfiguredPublicDir: () => getConfiguredValue(publicDirOption),
	getConfiguredKeyboardShortcutsEnabled: () =>
		getConfiguredValue(keyboardShortcutsOption),
	getConfiguredDarkMode: () => getConfiguredValue(darkModeOption),
	getConfiguredExperimentalClientSideRenderingEnabled: () =>
		experimentalClientSideRenderingEnabled,
	getConfiguredExperimentalVisualModeEnabled: () =>
		experimentalVisualModeEnabled,
	getConfiguredNumberOfSharedAudioTags: () =>
		getConfiguredValue(numberOfSharedAudioTagsOption),
	getConfiguredAudioLatencyHint: () =>
		getConfiguredValue(audioLatencyHintOption),
	getConfiguredBinariesDirectory: () =>
		getConfiguredValue(BrowserSafeApis.options.binariesDirectoryOption),
	getConfiguredEnableCrossSiteIsolation: () =>
		getConfiguredValue(enableCrossSiteIsolationOption),
	getConfiguredAskAIEnabled: () => getConfiguredValue(askAIOption),
	getConfiguredForceNewStudio: () => getConfiguredValue(forceNewStudioOption),
	getConfiguredIPv4: () => getConfiguredValue(ipv4Option),
	getConfiguredRspackEnabled: () => getConfiguredValue(rspackOption),
	getConfiguredImageSequencePattern: () =>
		getConfiguredValue(imageSequencePatternOption),
	getConfiguredStillImageFormat: (): StillImageFormat | null =>
		getConfiguredValue(stillImageFormatOption),
	getConfiguredVideoImageFormat: (): VideoImageFormat | null =>
		getConfiguredValue(videoImageFormatOption),
	getConfiguredJpegQuality: () => getConfiguredValue(jpegQualityOption),
	getConfiguredVideoCodec: () => getConfiguredValue(videoCodecOption),
	getConfiguredScale: () => getConfiguredValue(scaleOption),
	getConfiguredMuted: () => getConfiguredValue(mutedOption),
	getConfiguredEnforceAudioTrack: () => getConfiguredValue(enforceAudioOption),
	getConfiguredProResProfile: () => getConfiguredValue(proResProfileOption),
	getConfiguredX264Preset: () => getConfiguredValue(x264Option),
	getConfiguredPixelFormat: () => getConfiguredValue(pixelFormatOption),
	getConfiguredAudioBitrate: () => getConfiguredValue(audioBitrateOption),
	getConfiguredVideoBitrate: () => getConfiguredValue(videoBitrateOption),
	getConfiguredEncodingBufferSize: () =>
		getConfiguredValue(encodingBufferSizeOption),
	getConfiguredEncodingMaxRate: () => getConfiguredValue(encodingMaxRateOption),
	getConfiguredEveryNthFrame: () => getConfiguredValue(everyNthFrameOption),
	getConfiguredDelayRenderTimeout: () =>
		getConfiguredValue(delayRenderTimeoutInMillisecondsOption),
	getConfiguredAudioCodec: () => getConfiguredValue(audioCodecOption),
	getConfiguredDisableWebSecurity: () =>
		getConfiguredValue(disableWebSecurityOption),
	getConfiguredHeadless: () => getConfiguredValue(headlessOption),
	getConfiguredIgnoreCertificateErrors: () =>
		getConfiguredValue(ignoreCertificateErrorsOption),
	getConfiguredOpenGlRenderer: () => getConfiguredValue(glOption),
	getConfiguredOffthreadVideoCacheSizeInBytes: () =>
		getConfiguredValue(offthreadVideoCacheSizeInBytesOption),
	getConfiguredColorSpace: (): ColorSpace | null =>
		getConfiguredValue(colorSpaceOption),
	getConfiguredMultiProcessOnLinux: () =>
		getConfiguredValue(enableMultiprocessOnLinuxOption),
	getConfiguredUserAgent: () => getConfiguredValue(userAgentOption),
	getConfiguredRepro: () => getConfiguredValue(reproOption),
	getConfiguredNumberOfGifLoops: (): NumberOfGifLoops | null =>
		getConfiguredValue(numberOfGifLoopsOption),
	getConfiguredBeepOnFinish: () => getConfiguredValue(beepOnFinishOption),
	getConfiguredForSeamlessAacConcatenation: () =>
		getConfiguredValue(forSeamlessAacConcatenationOption),
	getConfiguredHardwareAcceleration: (): HardwareAccelerationOption =>
		getConfiguredValue(hardwareAccelerationOption),
	getConfiguredChromeMode: (): ChromeMode | null =>
		getConfiguredValue(BrowserSafeApis.options.chromeModeOption),
	getConfiguredMediaCacheSizeInBytes: () =>
		getConfiguredValue(mediaCacheSizeInBytesOption),
	getConfiguredPublicLicenseKey: () =>
		getConfiguredValue(publicLicenseKeyOption),
	getConfiguredOffthreadVideoThreads: () =>
		getConfiguredValue(BrowserSafeApis.options.offthreadVideoThreadsOption),
	getConfiguredOverrideWidth: () => getConfiguredValue(overrideWidthOption),
	getConfiguredOverrideHeight: () => getConfiguredValue(overrideHeightOption),
	getConfiguredOverrideFps: () => getConfiguredValue(overrideFpsOption),
	getConfiguredOverrideDuration: () =>
		getConfiguredValue(overrideDurationOption),
	getConfiguredBrowserExecutable: (): BrowserExecutable | null =>
		getConfiguredValue(browserExecutableOption),
	getConfiguredCrf: (): Crf | null => getConfiguredValue(crfOption),
	getConfiguredDeleteAfter: (): DeleteAfter | null =>
		getConfiguredValue(deleteAfterOption),
	getConfiguredPublicPath: () => getConfiguredValue(publicPathOption),
};
