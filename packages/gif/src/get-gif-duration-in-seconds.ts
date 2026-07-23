import {getRemotionEnvironment} from 'remotion';
import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import type {GifState} from './props';
import {parseGif, parseWithWorker} from './react-tools';
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
export const getGifDurationInSeconds = async (
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
		return calcDuration(inCache);
	}

	if (getRemotionEnvironment().isRendering) {
		const renderingParsed = parseWithWorker({
			src: resolvedSrc,
			cacheKey,
			requestInit: options?.requestInit,
		});
		const resolved = await renderingParsed.prom;
		volatileGifCache.set(cacheKey, resolved);
		return calcDuration(resolved);
	}

	const parsed = await parseGif({
		src: resolvedSrc,
		controller: new AbortController(),
		requestInit: options?.requestInit,
	});
	volatileGifCache.set(cacheKey, parsed);

	return calcDuration(parsed);
};
