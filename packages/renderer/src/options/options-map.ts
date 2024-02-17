import {audioBitrateOption} from './audio-bitrate';
import {colorSpaceOption} from './color-space';
import {deleteAfterOption} from './delete-after';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {jpegQualityOption} from './jpeg-quality';
import {muteOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytes} from './offthreadvideo-cache-size';
import {reproOption} from './repro';
import {videoBitrate} from './video-bitrate';
import {videoCodecOption} from './video-codec';
import {x264Option} from './x264-preset';

export const optionsMap = {
	renderMedia: {
		offthreadVideoCacheSizeInBytes,
		videoBitrate,
		numberOfGifLoops: numberOfGifLoopsOption,
		repro: reproOption,
		x264Preset: x264Option,
		audioBitrate: audioBitrateOption,
		colorSpace: colorSpaceOption,
		codec: videoCodecOption,
		jpegQuality: jpegQualityOption,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		muted: muteOption,
	},
	renderStill: {
		offthreadVideoCacheSizeInBytes,
		jpegQuality: jpegQualityOption,
	},
	getCompositions: {
		offthreadVideoCacheSizeInBytes,
	},
	selectComposition: {
		offthreadVideoCacheSizeInBytes,
	},
	renderFrames: {
		offthreadVideoCacheSizeInBytes,
		jpegQuality: jpegQualityOption,
	},
	renderMediaOnLambda: {
		offthreadVideoCacheSizeInBytes,
		videoBitrate,
		numberOfGifLoops: numberOfGifLoopsOption,
		audioBitrate: audioBitrateOption,
		deleteAfter: deleteAfterOption,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		colorSpace: colorSpaceOption,
		muted: muteOption,
	},
	renderStillOnLambda: {
		offthreadVideoCacheSizeInBytes,
		jpegQuality: jpegQualityOption,
	},
	getCompositionsOnLambda: {
		offthreadVideoCacheSizeInBytes,
	},
	renderMediaOnCloudRun: {
		offthreadVideoCacheSizeInBytes,
		numberOfGifLoops: numberOfGifLoopsOption,
		colorSpace: colorSpaceOption,
		audioBitrate: audioBitrateOption,
		videoBitrate,
		x264Preset: x264Option,
		encodingMaxRate: encodingMaxRateOption,
		encodingBufferSize: encodingBufferSizeOption,
		muted: muteOption,
	},
	renderStillOnCloudRun: {
		offthreadVideoCacheSizeInBytes,
	},
} as const;
