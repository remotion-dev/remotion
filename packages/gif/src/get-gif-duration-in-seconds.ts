import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import {parseGifDurationInSeconds} from './parse-generate';
import type {GifState} from './props';
import {getGifCacheKey} from './request-init';
import {resolveGifSource} from './resolve-gif-source';

const calcDuration = (parsed: GifState) => {
	return (
		parsed.delays.reduce((sum: number, delay: number) => sum + delay, 0) / 1000
	);
};

/*
 * @description Gets the duration in seconds of a GIF.
 * @see [Documentation](https://remotion.dev/docs/gif/get-gif-duration-in-seconds)
 */
export const getGifDurationInSeconds = (
	src: string,
	options?: {
		requestInit?: RequestInit;
	},
) => {
	const resolvedSrc = resolveGifSource(src);
	const cacheKey = getGifCacheKey({
		resolvedSrc,
		requestInit: options?.requestInit,
	});
	const inCache =
		volatileGifCache.get(cacheKey) ?? manuallyManagedGifCache.get(cacheKey);
	if (inCache) {
		return Promise.resolve(calcDuration(inCache));
	}

	return parseGifDurationInSeconds(resolvedSrc, {
		signal: new AbortController().signal,
		requestInit: options?.requestInit,
	});
};
