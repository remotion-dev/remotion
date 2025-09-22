import {makeAudioManager} from './audio-extraction/audio-manager';
import {makeKeyframeManager} from './video-extraction/keyframe-manager';

export const MAX_CACHE_SIZE = 1000 * 1000 * 1000; // 1GB
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
