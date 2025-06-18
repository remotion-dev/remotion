// Cache the thumbnails of the timeline

export type FrameDatabaseKey = string & {__brand: 'FrameDatabaseKey'};

export const makeFrameDatabaseKey = (
	src: string,
	timestamp: number,
): FrameDatabaseKey => `${src}-${timestamp}` as FrameDatabaseKey;

export const frameDatabase: Map<FrameDatabaseKey, VideoFrame> = new Map();

export const getTimestampFromFrameDatabaseKey = (key: FrameDatabaseKey) => {
	const split = key.split('-');
	return Number(split[split.length - 1]);
};

export const getAspectRatioFromCache = (src: string) => {
	// find any key that has the same src and is before the timestamp
	const keys = frameDatabase.keys();
	for (const key of keys) {
		if (key.startsWith(src)) {
			const value = frameDatabase.get(key);
			if (value) {
				return value.displayWidth / value.displayHeight;
			}
		}
	}

	return null;
};
