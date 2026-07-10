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

type MakeLoopingIteratorOptions = {
	audioSink: AudioBufferSink;
	seekTimeInSeconds: number;
	loopStartInSeconds: number;
	segmentEndInSeconds: number;
	playbackRate: number;
	sequenceDurationInSeconds: number;
};

async function* makeLoopingIterator({
	audioSink,
	seekTimeInSeconds,
	loopStartInSeconds,
	segmentEndInSeconds,
	playbackRate,
	sequenceDurationInSeconds,
}: MakeLoopingIteratorOptions): AsyncGenerator<
	BufferWithMediaTimestamp,
	void,
	unknown
> {
	// The first pass starts at the seek position, every following pass replays
	// the full loop segment from its start. Timestamps continue monotonically
	// across passes so that chunks belonging to a later loop iteration can be
	// scheduled ahead of the loop boundary.
	let passStartInSeconds = seekTimeInSeconds;
	let passBaseTimestamp = seekTimeInSeconds;

	let broken = false;
	while (true) {
		for await (const item of makeIteratorWithPrimingInner(
			audioSink,
			passStartInSeconds,
			segmentEndInSeconds,
		)) {
			const timestamp =
				passBaseTimestamp + (item.timestamp - passStartInSeconds);

			const endTimestamp = timestamp - seekTimeInSeconds + item.buffer.duration;
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

		passBaseTimestamp += segmentEndInSeconds - passStartInSeconds;
		passStartInSeconds = loopStartInSeconds;
	}
}

export const makeIteratorWithPriming = ({
	audioSink,
	timeToSeek,
	maximumTimestamp,
	loop,
	loopStartInSeconds,
	playbackRate,
	sequenceDurationInSeconds,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
	loop: boolean;
	loopStartInSeconds: number;
	playbackRate: number;
	sequenceDurationInSeconds: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> => {
	if (loop) {
		return makeLoopingIterator({
			audioSink,
			seekTimeInSeconds: timeToSeek,
			loopStartInSeconds,
			segmentEndInSeconds: maximumTimestamp,
			playbackRate,
			sequenceDurationInSeconds,
		});
	}

	return makeIteratorWithPrimingInner(audioSink, timeToSeek, maximumTimestamp);
};
