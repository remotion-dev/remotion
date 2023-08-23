import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import {parseWithWorker} from './react-tools';
import {resolveGifSource} from './resolve-gif-source';

/**
 * @description Returns an object with two entries: waitUntilDone() that returns a Promise which can be awaited and free() which will cancel preloading or free up the memory if the GIF is not being used anymore.
 * @see [Documentation](https://www.remotion.dev/docs/gif/preload-gif)
 */
export const preloadGif = (
	src: string,
): {
	waitUntilDone: () => Promise<void>;
	free: () => void;
} => {
	const resolvedSrc = resolveGifSource(src);

	if (volatileGifCache.has(resolvedSrc)) {
		return {
			waitUntilDone: () => Promise.resolve(),
			free: () => volatileGifCache.delete(resolvedSrc),
		};
	}

	if (manuallyManagedGifCache.has(resolvedSrc)) {
		return {
			waitUntilDone: () => Promise.resolve(),
			free: () => manuallyManagedGifCache.delete(resolvedSrc),
		};
	}

	const {prom, cancel} = parseWithWorker(resolvedSrc);

	let deleted = false;

	prom.then((p) => {
		if (!deleted) {
			manuallyManagedGifCache.set(resolvedSrc, p);
		}
	});

	return {
		waitUntilDone: () => prom.then(() => undefined),
		free: () => {
			cancel();
			deleted = true;
			manuallyManagedGifCache.delete(resolvedSrc);
		},
	};
};
