import {Internals} from 'remotion';
import {gifCache} from './gif-cache';
import type {GifState} from './props';
import {parseGif, parseWithWorker} from './react-tools';

const calcDuration = (parsed: GifState) => {
	return (
		parsed.delays.reduce((sum: number, delay: number) => sum + delay, 0) / 1000
	);
};

export const getGifDurationInSeconds = async (src: string) => {
	const resolvedSrc = new URL(src, window.location.origin).href;
	const inCache = gifCache.get(resolvedSrc);
	if (inCache) {
		return calcDuration(inCache);
	}

	if (Internals.getRemotionEnvironment() === 'rendering') {
		const renderingParsed = parseWithWorker(resolvedSrc);
		const resolved = await renderingParsed.prom;
		gifCache.set(resolvedSrc, resolved);
		return calcDuration(resolved);
	}

	const parsed = await parseGif({
		src: resolvedSrc,
		controller: new AbortController(),
	});
	gifCache.set(resolvedSrc, parsed);

	return calcDuration(parsed);
};
