import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';

const AUDIO_PRIMING_SECONDS = 0.5;

export type BufferWithMediaTimestamp = {
	buffer: WrappedAudioBuffer;
	timestamp: number;
	// Number of seconds to skip at the start of the underlying buffer. This is
	// needed when a priming buffer crosses the beginning of a pass.
	startOffsetInSeconds: number;
	// Span occupied by this item on the emitted timeline. Looping items shift
	// their timestamp to the audible boundary, so their source offset is not
	// part of this duration.
	timelineDurationInSeconds: number;
};

export async function* makeIteratorWithPriming({
	audioSink,
	timeToSeek,
	maximumTimestamp,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
}): AsyncGenerator<BufferWithMediaTimestamp, void, unknown> {
	const primingStart = Math.max(0, timeToSeek - AUDIO_PRIMING_SECONDS);
	const iterator = audioSink.buffers(primingStart, maximumTimestamp);

	for await (const buffer of iterator) {
		if (buffer.timestamp + buffer.duration <= timeToSeek) {
			continue;
		}

		yield {
			buffer,
			timestamp: buffer.timestamp,
			startOffsetInSeconds: Math.max(0, timeToSeek - buffer.timestamp),
			timelineDurationInSeconds: buffer.duration,
		};
	}
}

type MakeLoopingIteratorOptions = {
	audioSink: AudioBufferSink;
	seekTimeInSeconds: number;
	loopStartInSeconds: number;
	segmentEndInSeconds: number;
	maximumContinuousTimestamp: number;
};

export async function* makeLoopingIterator({
	audioSink,
	seekTimeInSeconds,
	loopStartInSeconds,
	segmentEndInSeconds,
	maximumContinuousTimestamp,
}: MakeLoopingIteratorOptions): AsyncGenerator<
	BufferWithMediaTimestamp,
	void,
	unknown
> {
	if (segmentEndInSeconds <= loopStartInSeconds) {
		throw new Error(
			`Cannot loop audio over an empty range (${loopStartInSeconds} to ${segmentEndInSeconds})`,
		);
	}

	// The first pass starts at the seek position, every following pass replays
	// the full loop segment from its start. Timestamps continue monotonically
	// across passes so that chunks belonging to a later loop iteration can be
	// scheduled ahead of the loop boundary.
	let passStartInSeconds = seekTimeInSeconds;
	let passBaseTimestamp = seekTimeInSeconds;

	while (true) {
		let yieldedInPass = false;
		for await (const item of makeIteratorWithPriming({
			audioSink,
			timeToSeek: passStartInSeconds,
			maximumTimestamp: segmentEndInSeconds,
		})) {
			yieldedInPass = true;
			// A priming buffer may begin before the pass boundary. Put its audible
			// start exactly at the continuous pass boundary and retain the source
			// offset so Web Audio skips the pre-boundary samples on every pass.
			const timestamp =
				passBaseTimestamp +
				(item.timestamp - passStartInSeconds) +
				item.startOffsetInSeconds;
			const effectiveDuration =
				item.buffer.duration - item.startOffsetInSeconds;

			if (timestamp + effectiveDuration > maximumContinuousTimestamp) {
				return;
			}

			yield {
				buffer: item.buffer,
				timestamp,
				startOffsetInSeconds: item.startOffsetInSeconds,
				timelineDurationInSeconds: effectiveDuration,
			};
		}

		if (!yieldedInPass) {
			throw new Error(
				`Audio loop pass from ${passStartInSeconds} to ${segmentEndInSeconds} yielded no buffers`,
			);
		}

		passBaseTimestamp += segmentEndInSeconds - passStartInSeconds;
		passStartInSeconds = loopStartInSeconds;
	}
}
