import type {
	AudioBufferSink,
	CanvasSink,
	WrappedAudioBuffer,
	WrappedCanvas,
} from 'mediabunny';

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

const makeBufferWithPriming = (
	audioSink: AudioBufferSink,
	timeToSeek: number,
) => {
	// TODO: Priming
	return audioSink.buffers(timeToSeek);
};

export const makePrewarmedAudioIteratorCache = (audioSink: AudioBufferSink) => {
	const prewarmedAudioIterators: Map<
		number,
		AsyncGenerator<WrappedAudioBuffer, void, unknown>
	> = new Map();

	const prewarmIteratorForLooping = ({timeToSeek}: {timeToSeek: number}) => {
		if (!prewarmedAudioIterators.has(timeToSeek)) {
			prewarmedAudioIterators.set(
				timeToSeek,
				makeBufferWithPriming(audioSink, timeToSeek),
			);
		}
	};

	const makeIteratorOrUsePrewarmed = (timeToSeek: number) => {
		const prewarmedIterator = prewarmedAudioIterators.get(timeToSeek);
		if (prewarmedIterator) {
			prewarmedAudioIterators.delete(timeToSeek);
			return prewarmedIterator;
		}

		const iterator = makeBufferWithPriming(audioSink, timeToSeek);
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
