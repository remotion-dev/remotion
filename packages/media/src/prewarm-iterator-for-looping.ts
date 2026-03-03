import type {
	AudioBufferSink,
	CanvasSink,
	WrappedAudioBuffer,
	WrappedCanvas,
} from 'mediabunny';
import {makeIteratorWithPriming} from './make-iterator-with-priming';

export const makePrewarmedVideoIteratorCache = (videoSink: CanvasSink) => {
	const prewarmedVideoIterators: Map<
		number,
		AsyncGenerator<WrappedCanvas, void, unknown>
	> = new Map();

	const prewarmIteratorForLooping = ({timeToSeek}: {timeToSeek: number}) => {
		if (!prewarmedVideoIterators.has(timeToSeek)) {
			prewarmedVideoIterators.set(timeToSeek, videoSink.canvases(timeToSeek));
		}
	};

	const makeIteratorOrUsePrewarmed = (timeToSeek: number) => {
		const prewarmedIterator = prewarmedVideoIterators.get(timeToSeek);
		if (prewarmedIterator) {
			prewarmedVideoIterators.delete(timeToSeek);
			return prewarmedIterator;
		}

		const iterator = videoSink.canvases(timeToSeek);
		return iterator;
	};

	const destroy = () => {
		for (const iterator of prewarmedVideoIterators.values()) {
			iterator.return();
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

const makeKey = (timeToSeek: number, maximumTimestamp: number) => {
	return `${timeToSeek}-${maximumTimestamp}`;
};

export const makePrewarmedAudioIteratorCache = (audioSink: AudioBufferSink) => {
	const prewarmedAudioIterators: Map<
		string,
		AsyncGenerator<WrappedAudioBuffer, void, unknown>
	> = new Map();

	const prewarmIteratorForLooping = ({
		timeToSeek,
		maximumTimestamp,
	}: {
		timeToSeek: number;
		maximumTimestamp: number;
	}) => {
		if (!prewarmedAudioIterators.has(makeKey(timeToSeek, maximumTimestamp))) {
			prewarmedAudioIterators.set(
				makeKey(timeToSeek, maximumTimestamp),
				makeIteratorWithPriming({audioSink, timeToSeek, maximumTimestamp}),
			);
		}
	};

	const makeIteratorOrUsePrewarmed = (
		timeToSeek: number,
		maximumTimestamp: number,
	) => {
		const prewarmedIterator = prewarmedAudioIterators.get(
			makeKey(timeToSeek, maximumTimestamp),
		);
		if (prewarmedIterator) {
			prewarmedAudioIterators.delete(makeKey(timeToSeek, maximumTimestamp));
			return prewarmedIterator;
		}

		const iterator = makeIteratorWithPriming({
			audioSink,
			timeToSeek,
			maximumTimestamp,
		});
		return iterator;
	};

	const destroy = () => {
		for (const iterator of prewarmedAudioIterators.values()) {
			iterator.return();
		}

		prewarmedAudioIterators.clear();
	};

	return {
		prewarmIteratorForLooping,
		makeIteratorOrUsePrewarmed,
		destroy,
	};
};

export type PrewarmedAudioIteratorCache = ReturnType<
	typeof makePrewarmedAudioIteratorCache
>;
