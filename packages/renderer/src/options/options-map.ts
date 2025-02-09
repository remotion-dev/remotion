import {apiKeyOption} from './api-key';
import {audioBitrateOption} from './audio-bitrate';
import {audioCodecOption} from './audio-codec';
import {binariesDirectoryOption} from './binaries-directory';
import {chromeModeOption} from './chrome-mode';
import {colorSpaceOption} from './color-space';
import {crfOption} from './crf';
import {deleteAfterOption} from './delete-after';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {forSeamlessAacConcatenationOption} from './for-seamless-aac-concatenation';
import {hardwareAccelerationOption} from './hardware-acceleration';
import {jpegQualityOption} from './jpeg-quality';
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
import {videoCodecOption} from './video-codec';
import {x264Option} from './x264-preset';

export const optionsMap = {
	renderMedia: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		videoBitrate: videoBitrateOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		repro: reproOption,
		x264Preset: x264Option,
		audioBitrate: audioBitrateOption,
		colorSpace: colorSpaceOption,
		codec: videoCodecOption,
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
	},
	stitchFramesToVideo: {
		separateAudioTo: separateAudioOption,
		hardwareAcceleration: hardwareAccelerationOption,
	},
	renderStill: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	getCompositions: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	selectComposition: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	renderFrames: {
		forSeamlessAacConcatenation: forSeamlessAacConcatenationOption,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
		onBrowserDownload: onBrowserDownloadOption,
		chromeMode: chromeModeOption,
	},
	renderMediaOnLambda: {
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
	},
	renderStillOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		deleteAfter: deleteAfterOption,
		scale: scaleOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		apiKey: apiKeyOption,
	},
	getCompositionsOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		offthreadVideoThreads: offthreadVideoThreadsOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
	renderMediaOnCloudRun: {
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
