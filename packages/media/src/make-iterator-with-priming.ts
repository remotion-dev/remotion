import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';

const AUDIO_PRIMING_SECONDS = 0.5;

export type BufferWithMediaTimestamp = {
	buffer: WrappedAudioBuffer;
	timestamp: number;
};

async function* makeIteratorWithPrimingInner(
	audioSink: AudioBufferSink,
	timeToSeek: number,
	maximumTimestamp: number,
): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> {
	const primingStart = Math.max(0, timeToSeek - AUDIO_PRIMING_SECONDS);
	const iterator = audioSink.buffers(primingStart, maximumTimestamp);

	for await (const buffer of iterator) {
		if (buffer.timestamp + buffer.duration <= timeToSeek) {
			continue;
		}

		yield {
			buffer,
			timestamp: buffer.timestamp,
		};
	}
}

async function* makeLoopingIterator({
	audioSink,
	timeToSeek,
	segmentStartInSeconds,
	segmentEndInSeconds,
	playbackRate,
	sequenceDurationInSeconds,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	segmentStartInSeconds: number;
	segmentEndInSeconds: number;
	playbackRate: number;
	sequenceDurationInSeconds: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> {
	const duration = segmentEndInSeconds - segmentStartInSeconds;
	if (duration <= 0) {
		return;
	}

	let iteration = 0;

	while (true) {
		const startTimestamp = iteration === 0 ? timeToSeek : segmentStartInSeconds;
		const timestampOffset = iteration === 0 ? 0 : iteration * duration;
		for await (const item of makeIteratorWithPrimingInner(
			audioSink,
			startTimestamp,
			segmentEndInSeconds,
		)) {
			const timestamp = item.timestamp + timestampOffset;

			const endTimestamp =
				timestamp - segmentStartInSeconds + item.buffer.duration;
			if (endTimestamp > sequenceDurationInSeconds * playbackRate) {
				return;
			}

			yield {
				buffer: item.buffer,
				timestamp,
			};
		}

		iteration++;
	}
}

export const makeIteratorWithPriming = ({
	audioSink,
	timeToSeek,
	maximumTimestamp,
	loopStartInSeconds,
	loop,
	playbackRate,
	sequenceDurationInSeconds,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
	loopStartInSeconds?: number;
	loop: boolean;
	playbackRate: number;
	sequenceDurationInSeconds: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> => {
	if (loop) {
		return makeLoopingIterator({
			audioSink,
			timeToSeek,
			segmentStartInSeconds: loopStartInSeconds ?? timeToSeek,
			segmentEndInSeconds: maximumTimestamp,
			playbackRate,
			sequenceDurationInSeconds,
		});
	}

	return makeIteratorWithPrimingInner(audioSink, timeToSeek, maximumTimestamp);
};
