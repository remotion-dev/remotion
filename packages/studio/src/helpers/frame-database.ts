// Cache the thumbnails of the timeline

export type FrameDatabaseKey = string & {__brand: 'FrameDatabaseKey'};

export const makeFrameDatabaseKey = (
	src: string,
	timestamp: number,
): FrameDatabaseKey => `${src}-${timestamp}` as FrameDatabaseKey;

export const frameDatabase: Map<FrameDatabaseKey, VideoFrame> = new Map();

export const getTimestampFromFrameDatabaseKey = (key: FrameDatabaseKey) => {
	const [, timestamp] = key.split('-');
	return Number(timestamp);
};
