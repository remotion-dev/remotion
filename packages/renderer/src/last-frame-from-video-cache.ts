// OffthreadVideo requires sometimes that the last frame of a video gets extracted, however, this can be slow. We allocate a cache for it but that can be garbage collected

import type {OffthreadVideoImageFormat} from 'remotion';
import type {FfmpegExecutable} from './ffmpeg-executable';
import type {SpecialVCodecForTransparency} from './get-video-info';

export type LastFrameOptions = {
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	offset: number;
	src: string;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
	imageFormat: OffthreadVideoImageFormat;
	needsResize: [number, number] | null;
};

let map: Record<string, {lastAccessed: number; data: Buffer}> = {};

const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

let bufferSize = 0;

const makeLastFrameCacheKey = (options: LastFrameOptions) => {
	return [
		options.ffmpegExecutable,
		options.offset,
		options.src,
		options.imageFormat,
	].join('-');
};

export const setLastFrameInCache = (
	options: LastFrameOptions,
	data: Buffer
) => {
	const key = makeLastFrameCacheKey(options);
	if (map[key]) {
		bufferSize -= map[key].data.byteLength;
	}

	map[key] = {data, lastAccessed: Date.now()};
	bufferSize += data.byteLength;
	ensureMaxSize();
};

export const getLastFrameFromCache = (
	options: LastFrameOptions
): Buffer | null => {
	const key = makeLastFrameCacheKey(options);

	if (!map[key]) {
		return null;
	}

	map[key].lastAccessed = Date.now();
	return map[key].data ?? null;
};

const removedLastFrameFromCache = (key: string) => {
	if (!map[key]) {
		return;
	}

	bufferSize -= map[key].data.byteLength;

	delete map[key];
};

const ensureMaxSize = () => {
	// eslint-disable-next-line no-unmodified-loop-condition
	while (bufferSize > MAX_CACHE_SIZE) {
		const earliest = Object.entries(map).sort((a, b) => {
			return a[1].lastAccessed - b[1].lastAccessed;
		})[0];

		removedLastFrameFromCache(earliest[0]);
	}
};

export const clearLastFileCache = () => {
	map = {};
};
