// Cache the thumbnails of the timeline

export type FrameDatabaseKey = string & {__brand: 'FrameDatabaseKey'};

const KEY_SEPARATOR = '|';

export const makeFrameDatabaseKey = (
	src: string,
	timestamp: number,
): FrameDatabaseKey => `${src}${KEY_SEPARATOR}${timestamp}` as FrameDatabaseKey;

export const getFrameDatabaseKeyPrefix = (src: string): string => {
	return `${src}${KEY_SEPARATOR}`;
};

type VideoFrameAndLastUsed = {
	frame: VideoFrame;
	lastUsed: number;
	size: number;
};

const MAX_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

let totalCacheSize = 0;

export const frameDatabase: Map<FrameDatabaseKey, VideoFrameAndLastUsed> =
	new Map();
export const aspectRatioCache: Map<string, number> = new Map();

export const getTimestampFromFrameDatabaseKey = (key: FrameDatabaseKey) => {
	const split = key.split(KEY_SEPARATOR);
	return Number(split[split.length - 1]);
};

export const getAspectRatioFromCache = (src: string) => {
	const cached = aspectRatioCache.get(src);
	if (cached) {
		return cached;
	}

	return null;
};

const evictLRU = () => {
	while (totalCacheSize > MAX_CACHE_SIZE_BYTES && frameDatabase.size > 0) {
		let oldestKey: FrameDatabaseKey | undefined;
		let oldestTime = Infinity;

		for (const [key, candidate] of frameDatabase) {
			if (candidate.lastUsed < oldestTime) {
				oldestTime = candidate.lastUsed;
				oldestKey = key;
			}
		}

		if (!oldestKey) {
			break;
		}

		const entry = frameDatabase.get(oldestKey);
		if (entry) {
			totalCacheSize -= entry.size;
			entry.frame.close();
			frameDatabase.delete(oldestKey);
		}
	}
};

export const addFrameToCache = (key: FrameDatabaseKey, frame: VideoFrame) => {
	const existing = frameDatabase.get(key);
	if (existing) {
		totalCacheSize -= existing.size;
		existing.frame.close();
	}

	const size = frame.allocationSize();
	totalCacheSize += size;

	frameDatabase.set(key, {
		frame,
		lastUsed: Date.now(),
		size,
	});

	evictLRU();
};
