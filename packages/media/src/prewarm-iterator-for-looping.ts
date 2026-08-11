import type {CanvasSink} from 'mediabunny';
import type {CanvasAheadOfTimeIterator} from './canvas-ahead-of-time';
import {canvasesAheadOfTime} from './canvas-ahead-of-time';

export const makePrewarmedVideoIteratorCache = (videoSink: CanvasSink) => {
	const prewarmedVideoIterators: Map<number, CanvasAheadOfTimeIterator> =
		new Map();

	const prewarmIteratorForLooping = ({timeToSeek}: {timeToSeek: number}) => {
		if (!prewarmedVideoIterators.has(timeToSeek)) {
			prewarmedVideoIterators.set(
				timeToSeek,
				canvasesAheadOfTime(videoSink, timeToSeek),
			);
		}
	};

	const makeIteratorOrUsePrewarmed = (timeToSeek: number) => {
		const prewarmedIterator = prewarmedVideoIterators.get(timeToSeek);
		if (prewarmedIterator) {
			prewarmedVideoIterators.delete(timeToSeek);
			return prewarmedIterator;
		}

		return canvasesAheadOfTime(videoSink, timeToSeek);
	};

	const destroy = () => {
		for (const iterator of prewarmedVideoIterators.values()) {
			iterator.closeIterator();
		}

		prewarmedVideoIterators.clear();
	};

	return {
		prewarmIteratorForLooping,
		makeIteratorOrUsePrewarmed,
		destroy,
	};
};

export type PrewarmedVideoIteratorCache = ReturnType<
	typeof makePrewarmedVideoIteratorCache
>;
