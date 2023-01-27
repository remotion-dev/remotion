import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import {parseWithWorker} from './react-tools';
import {resolveGifSource} from './resolve-gif-source';

export const preloadGif = (
	src: string
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
