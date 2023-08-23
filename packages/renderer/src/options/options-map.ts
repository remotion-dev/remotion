import {offthreadVideoCacheSizeOption} from './offthreadvideo-cache-size';

export const optionsMap = {
	renderMedia: [offthreadVideoCacheSizeOption],
	renderStill: [offthreadVideoCacheSizeOption],
	getCompositions: [offthreadVideoCacheSizeOption],
	selectComposition: [offthreadVideoCacheSizeOption],
	renderFrames: [offthreadVideoCacheSizeOption],
	renderMediaOnLambda: [offthreadVideoCacheSizeOption],
	renderStillOnLambda: [offthreadVideoCacheSizeOption],
	getCompositionsOnLambda: [offthreadVideoCacheSizeOption],
	renderMediaOnCloudRun: [offthreadVideoCacheSizeOption],
	renderStillOnCloudRun: [offthreadVideoCacheSizeOption],
} as const;
