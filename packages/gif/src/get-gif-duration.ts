import {Internals} from 'remotion';
import {parseGif, parseWithWorker} from './react-tools';

export const getGifDurationInSeconds = async (src: string) => {
	const resolvedSrc = new URL(src, window.location.origin).href;

	if (Internals.getRemotionEnvironment() === 'rendering') {
		const renderingParsed = parseWithWorker(resolvedSrc);
		return (
			(await renderingParsed.prom).delays.reduce(
				(sum: number, delay: number) => sum + delay,
				0
			) / 1000
		);
	}

	const parsed = await parseGif({
		src: resolvedSrc,
		controller: new AbortController(),
	});

	return (
		parsed.delays.reduce((sum: number, delay: number) => sum + delay, 0) / 1000
	);
};
