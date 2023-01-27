import {gifCache} from './gif-cache';
import {parseWithWorker} from './react-tools';
import {resolveGifSource} from './resolve-gif-source';

export const preloadGif = (
	src: string
): {
	waitForDone: () => Promise<void>;
	free: () => void;
} => {
	const resolvedSrc = resolveGifSource(src);

	if (gifCache.has(resolvedSrc)) {
		return {
			waitForDone: () => Promise.resolve(),
			free: () => gifCache.delete(resolvedSrc),
		};
	}

	const {prom, cancel} = parseWithWorker(resolvedSrc);

	return {
		waitForDone: () => prom.then(() => undefined),
		free: () => {
			cancel();
			gifCache.delete(resolvedSrc);
		},
	};
};
