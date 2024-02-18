import {audioBitrateOption} from './audio-bitrate';
import {colorSpaceOption} from './color-space';
import {deleteAfterOption} from './delete-after';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {jpegQualityOption} from './jpeg-quality';
import {logLevelOption} from './log-level';
import {mutedOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';
import {reproOption} from './repro';
import {scaleOption} from './scale';
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
	},
	renderStill: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
	},
	getCompositions: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
	},
	selectComposition: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
	},
	renderFrames: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
	},
	renderMediaOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		videoBitrate: videoBitrateOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		audioBitrate: audioBitrateOption,
		deleteAfter: deleteAfterOption,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		colorSpace: colorSpaceOption,
		muted: mutedOption,
		logLevel: logLevelOption,
	},
	renderStillOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		jpegQuality: jpegQualityOption,
		logLevel: logLevelOption,
		deleteAfter: deleteAfterOption,
		scale: scaleOption,
	},
	getCompositionsOnLambda: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
	},
	renderMediaOnCloudRun: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		numberOfGifLoops: numberOfGifLoopsOption,
		colorSpace: colorSpaceOption,
		audioBitrate: audioBitrateOption,
		videoBitrate: videoBitrateOption,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		muted: mutedOption,
		logLevel: logLevelOption,
	},
	renderStillOnCloudRun: {
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytesOption,
		logLevel: logLevelOption,
		scale: scaleOption,
		jpegQuality: jpegQualityOption,
	},
} as const;
