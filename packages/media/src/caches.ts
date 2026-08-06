import React from 'react';
import {Internals, type LogLevel} from 'remotion';
import {makeAudioManager} from './audio-extraction/audio-manager';
import {getMaxVideoCacheSize} from './max-cache-size';
import {makeKeyframeManager} from './video-extraction/keyframe-manager';

// Frames can be out of order, but we don't expect them to be more than 0.2 seconds out of order
export const getSafeWindowOfMonotonicity = (fps: number) => (0.2 * 30) / fps;

export const keyframeManager = makeKeyframeManager();
export const audioManager = makeAudioManager();

export const getTotalCacheStats = () => {
	const keyframeManagerCacheStats = keyframeManager.getCacheStats();
	const audioManagerCacheStats = audioManager.getCacheStats();

	return {
		count: keyframeManagerCacheStats.count + audioManagerCacheStats.count,
		totalSize:
			keyframeManagerCacheStats.totalSize + audioManagerCacheStats.totalSize,
	};
};

export {getMaxVideoCacheSize};

export const useMaxMediaCacheSize = (logLevel: LogLevel) => {
	const context = React.useContext(Internals.MaxMediaCacheSizeContext);
	if (context === null) {
		return getMaxVideoCacheSize(logLevel);
	}

	return context;
};
