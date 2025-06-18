// Cache the thumbnails of the timeline

export type FrameDatabaseKey = string & {__brand: 'FrameDatabaseKey'};

export const makeFrameDatabaseKey = (
	src: string,
	timestamp: number,
): FrameDatabaseKey => `${src}-${timestamp}` as FrameDatabaseKey;

export const frameDatabase: Map<FrameDatabaseKey, VideoFrame> = new Map();
export const aspectRatioCache: Map<string, number> = new Map();

export const getTimestampFromFrameDatabaseKey = (key: FrameDatabaseKey) => {
	const split = key.split('-');
	return Number(split[split.length - 1]);
};

export const getAspectRatioFromCache = (src: string) => {
	const cached = aspectRatioCache.get(src);
	if (cached) {
		return cached;
	}

	return null;
};
