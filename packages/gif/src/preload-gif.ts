import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import {parseWithWorker} from './react-tools';
import {getGifCacheKey} from './request-init';
import {resolveGifSource} from './resolve-gif-source';

/**
 * @description Returns an object with two entries: waitUntilDone() that returns a Promise which can be awaited and free() which will cancel preloading or free up the memory if the GIF is not being used anymore.
 * @see [Documentation](https://www.remotion.dev/docs/gif/preload-gif)
 */
export const preloadGif = (
	src: string,
	options?: {
		requestInit?: RequestInit;
	},
): {
	waitUntilDone: () => Promise<void>;
	free: () => void;
} => {
	const resolvedSrc = resolveGifSource(src);
	const cacheKey = getGifCacheKey({
		resolvedSrc,
		requestInit: options?.requestInit,
	});

	if (volatileGifCache.has(cacheKey)) {
		return {
			waitUntilDone: () => Promise.resolve(),
			free: () => volatileGifCache.delete(cacheKey),
		};
	}

	if (manuallyManagedGifCache.has(cacheKey)) {
		return {
			waitUntilDone: () => Promise.resolve(),
			free: () => manuallyManagedGifCache.delete(cacheKey),
		};
	}

	const {prom, cancel} = parseWithWorker({
		src: resolvedSrc,
		cacheKey,
		requestInit: options?.requestInit,
	});

	let deleted = false;

	prom.then((p) => {
		if (!deleted) {
			manuallyManagedGifCache.set(cacheKey, p);
		}
	});

	return {
		waitUntilDone: () => prom.then(() => undefined),
		free: () => {
			cancel();
			deleted = true;
			manuallyManagedGifCache.delete(cacheKey);
		},
	};
};
