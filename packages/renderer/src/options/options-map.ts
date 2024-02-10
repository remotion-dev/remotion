import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytes} from './offthreadvideo-cache-size';
import {preferLossless} from './prefer-lossless';
import {reproOption} from './repro';
import {videoBitrate} from './video-bitrate';

export const optionsMap = {
	renderMedia: {
		offthreadVideoCacheSizeInBytes,
		videoBitrate,
		numberOfGifLoops: numberOfGifLoopsOption,
		repro: reproOption,
	},
	renderStill: {
		offthreadVideoCacheSizeInBytes,
	},
	getCompositions: {
		offthreadVideoCacheSizeInBytes,
	},
	selectComposition: {
		offthreadVideoCacheSizeInBytes,
	},
	renderFrames: {
		offthreadVideoCacheSizeInBytes,
	},
	renderMediaOnLambda: {
		offthreadVideoCacheSizeInBytes,
		videoBitrate,
		numberOfGifLoops: numberOfGifLoopsOption,
		preferLossless,
	},
	renderStillOnLambda: {
		offthreadVideoCacheSizeInBytes,
	},
	getCompositionsOnLambda: {
		offthreadVideoCacheSizeInBytes,
	},
	renderMediaOnCloudRun: {
		offthreadVideoCacheSizeInBytes,
		numberOfGifLoops: numberOfGifLoopsOption,
		preferLossless,
	},
	renderStillOnCloudRun: {
		offthreadVideoCacheSizeInBytes,
	},
} as const;
