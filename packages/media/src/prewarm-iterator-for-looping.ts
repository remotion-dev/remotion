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

const AUDIO_PRIMING_SECONDS = 0.2;

async function* makeBufferWithPriming(
	audioSink: AudioBufferSink,
	timeToSeek: number,
): AsyncGenerator<WrappedAudioBuffer, void, unknown> {
	const primingStart = Math.max(0, timeToSeek - AUDIO_PRIMING_SECONDS);
	const iterator = audioSink.buffers(primingStart);

	for await (const buffer of iterator) {
		if (buffer.timestamp + buffer.duration <= timeToSeek) {
			continue;
		}

		yield buffer;
	}
}

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
