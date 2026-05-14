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
	segmentStartInSeconds,
	segmentEndInSeconds,
	playbackRate,
	sequenceDurationInSeconds,
}: {
	audioSink: AudioBufferSink;
	segmentStartInSeconds: number;
	segmentEndInSeconds: number;
	playbackRate: number;
	sequenceDurationInSeconds: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> {
	const duration = segmentEndInSeconds - segmentStartInSeconds;
	let iteration = 0;

	let broken = false;
	while (true) {
		for await (const item of makeIteratorWithPrimingInner(
			audioSink,
			segmentStartInSeconds,
			segmentEndInSeconds,
		)) {
			const timestamp = item.timestamp + iteration * duration;

			const endTimestamp =
				duration * iteration +
				(item.timestamp - segmentStartInSeconds + item.buffer.duration);
			if (endTimestamp > sequenceDurationInSeconds * playbackRate) {
				broken = true;
				break;
			}

			yield {
				buffer: item.buffer,
				timestamp,
			};
		}

		if (broken) {
			break;
		}

		iteration++;
	}
}

export const makeIteratorWithPriming = ({
	audioSink,
	timeToSeek,
	maximumTimestamp,
	loop,
	playbackRate,
	sequenceDurationInSeconds,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
	loop: boolean;
	playbackRate: number;
	sequenceDurationInSeconds: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> => {
	if (loop) {
		return makeLoopingIterator({
			audioSink,
			segmentStartInSeconds: timeToSeek,
			segmentEndInSeconds: maximumTimestamp,
			playbackRate,
			sequenceDurationInSeconds,
		});
	}

	return makeIteratorWithPrimingInner(audioSink, timeToSeek, maximumTimestamp);
};
