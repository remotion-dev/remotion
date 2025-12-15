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
			console.log('using prewarmed video iterator');
			return prewarmedIterator;
		}

		console.log('making new video');
		const iterator = videoSink.canvases(timeToSeek);
		return iterator;
	};

	const destroy = () => {
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

export const makePrewarmedAudioIteratorCache = (audioSink: AudioBufferSink) => {
	const prewarmedAudioIterators: Map<
		number,
		AsyncGenerator<WrappedAudioBuffer, void, unknown>
	> = new Map();

	const prewarmIteratorForLooping = ({timeToSeek}: {timeToSeek: number}) => {
		if (!prewarmedAudioIterators.has(timeToSeek)) {
			prewarmedAudioIterators.set(timeToSeek, audioSink.buffers(timeToSeek));
		}
	};

	const makeIteratorOrUsePrewarmed = (timeToSeek: number) => {
		const prewarmedIterator = prewarmedAudioIterators.get(timeToSeek);
		if (prewarmedIterator) {
			prewarmedAudioIterators.delete(timeToSeek);
			return prewarmedIterator;
		}

		console.log('making new audio', timeToSeek);

		const iterator = audioSink.buffers(timeToSeek);
		return iterator;
	};

	const destroy = () => {
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
