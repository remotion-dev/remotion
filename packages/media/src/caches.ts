import {cancelRender, type LogLevel} from 'remotion';
import {makeAudioManager} from './audio-extraction/audio-manager';
import {Log} from './log';
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
		window.remotion_videoCacheSizeInBytes !== undefined &&
		window.remotion_videoCacheSizeInBytes !== null
	) {
		if (window.remotion_videoCacheSizeInBytes < 240 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The minimum value for the "videoCacheSizeInBytes" prop is 240MB (${240 * 1024 * 1024}), got: ${window.remotion_videoCacheSizeInBytes}`,
				),
			);
		}

		if (window.remotion_videoCacheSizeInBytes > 20_000 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The maximum value for the "videoCacheSizeInBytes" prop is 20GB (${20000 * 1024 * 1024}), got: ${window.remotion_videoCacheSizeInBytes}`,
				),
			);
		}

		Log.verbose(
			logLevel,
			`Using @remotion/media cache size set using "videoCacheSizeInBytes": ${(window.remotion_videoCacheSizeInBytes / 1024 / 1024).toFixed(1)} MB`,
		);
		return window.remotion_videoCacheSizeInBytes;
	}

	if (
		window.remotion_initialMemoryAvailable !== undefined &&
		window.remotion_initialMemoryAvailable !== null
	) {
		const value = window.remotion_initialMemoryAvailable / 2;
		if (value < 240 * 1024 * 1024) {
			Log.verbose(
				logLevel,
				`Using @remotion/media cache size set based on minimum value of 240MB (which is more than half of the available system memory!)`,
			);
			return 240 * 1024 * 1024;
		}

		if (value > 20_000 * 1024 * 1024) {
			Log.verbose(
				logLevel,
				`Using @remotion/media cache size set based on maximum value of 20GB (which is less than half of the available system memory)`,
			);
			return 20_000 * 1024 * 1024;
		}

		Log.verbose(
			logLevel,
			`Using @remotion/media cache size set based on available memory (50% of available memory): ${(window.remotion_initialMemoryAvailable / 1024 / 1024).toFixed(1)} MB`,
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
