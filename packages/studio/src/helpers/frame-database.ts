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
};

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

// a 16:9 thumbnail is 43x23px wide - 43 * 23 * 4 = 4052 bytes
// Our allowance is a 50MB frame cache, so we can store 12340 thumbnails

const MAX_FRAMES_IN_CACHE = 12340;

export const clearOldFrames = () => {
	if (frameDatabase.size <= MAX_FRAMES_IN_CACHE) {
		return;
	}

	const framesToRemove = Array.from(frameDatabase.entries()).sort(
		(a, b) => a[1].lastUsed - b[1].lastUsed,
	);

	for (const [key, frame] of framesToRemove.slice(
		0,
		framesToRemove.length - MAX_FRAMES_IN_CACHE,
	)) {
		frame.frame.close();
		frameDatabase.delete(key);
	}
};

export const clearFramesForSrc = (src: string) => {
	const keysToRemove: FrameDatabaseKey[] = [];
	const prefix = getFrameDatabaseKeyPrefix(src);

	for (const [key, frame] of frameDatabase.entries()) {
		if (key.startsWith(prefix)) {
			frame.frame.close();
			keysToRemove.push(key);
		}
	}

	for (const key of keysToRemove) {
		frameDatabase.delete(key);
	}
};
