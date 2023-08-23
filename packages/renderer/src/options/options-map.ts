import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';

export const optionsMap = {
	renderMedia: [offthreadVideoCacheSizeInBytesOption],
	renderStill: [offthreadVideoCacheSizeInBytesOption],
	getCompositions: [offthreadVideoCacheSizeInBytesOption],
	selectComposition: [offthreadVideoCacheSizeInBytesOption],
	renderFrames: [offthreadVideoCacheSizeInBytesOption],
	renderMediaOnLambda: [offthreadVideoCacheSizeInBytesOption],
	renderStillOnLambda: [offthreadVideoCacheSizeInBytesOption],
	getCompositionsOnLambda: [offthreadVideoCacheSizeInBytesOption],
	renderMediaOnCloudRun: [offthreadVideoCacheSizeInBytesOption],
	renderStillOnCloudRun: [offthreadVideoCacheSizeInBytesOption],
} as const;
