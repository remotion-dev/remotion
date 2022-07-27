// OffthreadVideo requires sometimes that the last frame of a video gets extracted, however, this can be slow. We allocate a cache for it but that can be garbage collected

import type {OffthreadVideoImageFormat} from 'remotion';
import type {DownloadMap} from './assets/download-map';
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
	downloadMap: DownloadMap;
};

const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

let bufferSize = 0;

const makeLastFrameCacheKey = (options: LastFrameOptions) => {
	return [
		options.ffmpegExecutable,
		options.offset,
		options.src,
		options.imageFormat,
		// TODO: Download dir as well?
	].join('-');
};

export const setLastFrameInCache = (
	options: LastFrameOptions,
	data: Buffer
) => {
	const key = makeLastFrameCacheKey(options);
	if (options.downloadMap.lastFrameMap[key]) {
		bufferSize -= options.downloadMap.lastFrameMap[key].data.byteLength;
	}

	options.downloadMap.lastFrameMap[key] = {data, lastAccessed: Date.now()};
	bufferSize += data.byteLength;
	ensureMaxSize(options.downloadMap);
};

export const getLastFrameFromCache = (
	options: LastFrameOptions
): Buffer | null => {
	const key = makeLastFrameCacheKey(options);

	if (!options.downloadMap.lastFrameMap[key]) {
		return null;
	}

	options.downloadMap.lastFrameMap[key].lastAccessed = Date.now();
	return options.downloadMap.lastFrameMap[key].data ?? null;
};

const removedLastFrameFromCache = (key: string, downloadMap: DownloadMap) => {
	if (!downloadMap.lastFrameMap[key]) {
		return;
	}

	bufferSize -= downloadMap.lastFrameMap[key].data.byteLength;

	delete downloadMap.lastFrameMap[key];
};

const ensureMaxSize = (downloadMap: DownloadMap) => {
	// eslint-disable-next-line no-unmodified-loop-condition
	while (bufferSize > MAX_CACHE_SIZE) {
		const earliest = Object.entries(downloadMap.lastFrameMap).sort((a, b) => {
			return a[1].lastAccessed - b[1].lastAccessed;
		})[0];

		removedLastFrameFromCache(earliest[0], downloadMap);
	}
};

export const clearLastFileCache = (downloadMap: DownloadMap) => {
	downloadMap.lastFrameMap = {};
};
