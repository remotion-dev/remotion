import React from 'react';
import {cancelRender, Internals, type LogLevel} from 'remotion';
import {makeAudioManager} from './audio-extraction/audio-manager';
import {makeKeyframeManager} from './video-extraction/keyframe-manager';

// TODO: make it dependent on the fps and concurrency
export const SAFE_BACK_WINDOW_IN_SECONDS = 1;

export const keyframeManager = makeKeyframeManager();
export const audioManager = makeAudioManager();

export const getTotalCacheStats = async () => {
	const keyframeManagerCacheStats = await keyframeManager.getCacheStats();
	const audioManagerCacheStats = audioManager.getCacheStats();

	return {
		count: keyframeManagerCacheStats.count + audioManagerCacheStats.count,
		totalSize:
			keyframeManagerCacheStats.totalSize + audioManagerCacheStats.totalSize,
	};
};

const getUncachedMaxCacheSize = (logLevel: LogLevel) => {
	if (
		typeof window !== 'undefined' &&
		window.remotion_mediaCacheSizeInBytes !== undefined &&
		window.remotion_mediaCacheSizeInBytes !== null
	) {
		if (window.remotion_mediaCacheSizeInBytes < 240 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The minimum value for the "mediaCacheSizeInBytes" prop is 240MB (${240 * 1024 * 1024}), got: ${window.remotion_mediaCacheSizeInBytes}`,
				),
			);
		}

		if (window.remotion_mediaCacheSizeInBytes > 20_000 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The maximum value for the "mediaCacheSizeInBytes" prop is 20GB (${20000 * 1024 * 1024}), got: ${window.remotion_mediaCacheSizeInBytes}`,
				),
			);
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Using cache size set using "mediaCacheSizeInBytes": ${(window.remotion_mediaCacheSizeInBytes / 1024 / 1024).toFixed(1)} MB`,
		);
		return window.remotion_mediaCacheSizeInBytes;
	}

	if (
		typeof window !== 'undefined' &&
		window.remotion_initialMemoryAvailable !== undefined &&
		window.remotion_initialMemoryAvailable !== null
	) {
		const value = window.remotion_initialMemoryAvailable / 2;
		if (value < 500 * 1024 * 1024) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Using cache size set based on minimum value of 500MB (which is more than half of the available system memory!)`,
			);
			return 500 * 1024 * 1024;
		}

		if (value > 20_000 * 1024 * 1024) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Using cache size set based on maximum value of 20GB (which is less than half of the available system memory)`,
			);
			return 20_000 * 1024 * 1024;
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Using cache size set based on available memory (50% of available memory): ${(value / 1024 / 1024).toFixed(1)} MB`,
		);
		return value;
	}

	return 1000 * 1000 * 1000; // 1GB
};

let cachedMaxCacheSize: number | null = null;

export const getMaxVideoCacheSize = (logLevel: LogLevel) => {
	if (cachedMaxCacheSize !== null) {
		return cachedMaxCacheSize;
	}

	cachedMaxCacheSize = getUncachedMaxCacheSize(logLevel);
	return cachedMaxCacheSize;
};

export const useMaxMediaCacheSize = (logLevel: LogLevel) => {
	const context = React.useContext(Internals.MaxMediaCacheSizeContext);
	if (context === null) {
		return getMaxVideoCacheSize(logLevel);
	}

	return context;
};
