import {apiKeyOption} from './api-key';
import {audioBitrateOption} from './audio-bitrate';
import {audioCodecOption} from './audio-codec';
import {binariesDirectoryOption} from './binaries-directory';
import {chromeModeOption} from './chrome-mode';
import {colorSpaceOption} from './color-space';
import {crfOption} from './crf';
import {deleteAfterOption} from './delete-after';
import {disallowParallelEncodingOption} from './disallow-parallel-encoding';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {forSeamlessAacConcatenationOption} from './for-seamless-aac-concatenation';
import {hardwareAccelerationOption} from './hardware-acceleration';
import {imageSequencePatternOption} from './image-sequence-pattern';
import {jpegQualityOption} from './jpeg-quality';
import {licenseKeyOption} from './license-key';
import {logLevelOption} from './log-level';
import {mutedOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';
import {offthreadVideoThreadsOption} from './offthreadvideo-threads';
import {onBrowserDownloadOption} from './on-browser-download';
import {preferLosslessAudioOption} from './prefer-lossless';
import {reproOption} from './repro';
import {scaleOption} from './scale';
import {separateAudioOption} from './separate-audio';
import {throwIfSiteExistsOption} from './throw-if-site-exists';
import {delayRenderTimeoutInMillisecondsOption} from './timeout';
import {videoBitrateOption} from './video-bitrate';
import {mediaCacheSizeInBytesOption} from './video-cache-size';
import {videoCodecOption} from './video-codec';
import {x264Option} from './x264-preset';

export const optionsMap = {
	renderMedia: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		videoBitrate: videoBitrateOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		repro: reproOption,
		x264Preset: x264Option,
		audioBitrate: audioBitrateOption,
		colorSpace: colorSpaceOption,
		codec: videoCodecOption,
		disallowParallelEncoding: disallowParallelEncodingOption,
		jpegQuality: jpegQualityOption,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		muted: mutedOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		forSeamlessAacConcatenation: forSeamlessAacConcatenationOption,
		separateAudioTo: separateAudioOption,
		audioCodec: audioCodecOption,
		onBrowserDownload: onBrowserDownloadOption,
		hardwareAcceleration: hardwareAccelerationOption,
		chromeMode: chromeModeOption,
		apiKey: apiKeyOption,
		licenseKey: licenseKeyOption,
	},
	stitchFramesToVideo: {
		separateAudioTo: separateAudioOption,
		hardwareAcceleration: hardwareAccelerationOption,
	},
	renderStill: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
		apiKey: apiKeyOption,
		licenseKey: licenseKeyOption,
	},
	getCompositions: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	selectComposition: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	renderFrames: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		forSeamlessAacConcatenation: forSeamlessAacConcatenationOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
		imageSequencePattern: imageSequencePatternOption,
	},
	renderMediaOnLambda: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		videoBitrate: videoBitrateOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		preferLossless: preferLosslessAudioOption,
		audioBitrate: audioBitrateOption,
		deleteAfter: deleteAfterOption,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		colorSpace: colorSpaceOption,
		muted: mutedOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		apiKey: apiKeyOption,
		licenseKey: licenseKeyOption,
	},
	renderStillOnLambda: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		deleteAfter: deleteAfterOption,
		scale: scaleOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		apiKey: apiKeyOption,
		licenseKey: licenseKeyOption,
	},
	getCompositionsOnLambda: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
	renderMediaOnCloudRun: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		preferLossless: preferLosslessAudioOption,
		colorSpace: colorSpaceOption,
		audioBitrate: audioBitrateOption,
		videoBitrate: videoBitrateOption,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		muted: mutedOption,
		logLevel: logLevelOption,
		delayRenderTimeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		enforceAudioTrack: enforceAudioOption,
		scale: scaleOption,
		crf: crfOption,
		jpegQuality: jpegQualityOption,
	},
	renderStillOnCloudRun: {
		mediaCacheSizeInBytes: mediaCacheSizeInBytesOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		scale: scaleOption,
		jpegQuality: jpegQualityOption,
		delayRenderTimeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
	ensureBrowser: {
		logLevel: logLevelOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	openBrowser: {
		logLevel: logLevelOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	deploySiteLambda: {
		logLevel: logLevelOption,
		throwIfSiteExists: throwIfSiteExistsOption,
	},
	deploySiteCloudRun: {
		logLevel: logLevelOption,
	},
} as const;
