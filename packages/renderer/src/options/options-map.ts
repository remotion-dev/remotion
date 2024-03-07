import {audioBitrateOption} from './audio-bitrate';
import {binariesDirectoryOption} from './binaries-directory';
import {colorSpaceOption} from './color-space';
import {crfOption} from './crf';
import {deleteAfterOption} from './delete-after';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {forSeamlessAacConcatenationOption} from './for-seamless-aac-concatenation';
import {jpegQualityOption} from './jpeg-quality';
import {logLevelOption} from './log-level';
import {mutedOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';
import {preferLosslessAudioOption} from './prefer-lossless';
import {reproOption} from './repro';
import {scaleOption} from './scale';
import {separateAudioOption} from './separate-audio-to';
import {delayRenderTimeoutInMillisecondsOption} from './timeout';
import {videoBitrateOption} from './video-bitrate';
import {videoCodecOption} from './video-codec';
import {x264Option} from './x264-preset';

export const optionsMap = {
	renderMedia: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
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
	},
	stitchFramesToVideo: {
		forSeamlessAacConcatenation: forSeamlessAacConcatenationOption,
		separateAudioTo: separateAudioOption,
	},
	renderStill: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
	},
	getCompositions: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
	},
	selectComposition: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
	},
	renderFrames: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
		binariesDirectory: binariesDirectoryOption,
	},
	renderMediaOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
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
	},
	renderStillOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		deleteAfter: deleteAfterOption,
		scale: scaleOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
	getCompositionsOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
	renderMediaOnCloudRun: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
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
		logLevel: logLevelOption,
		scale: scaleOption,
		jpegQuality: jpegQualityOption,
		delayRenderTimeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption,
	},
} as const;
