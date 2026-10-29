import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';
import {isCodecReclaimedError} from './is-type-of-error';

const AUDIO_PRIMING_SECONDS = 0.5;

export type AudioBufferSlice = {
	buffer: WrappedAudioBuffer;
	// Position where the audible slice begins on the continuous timeline.
	timelineTimestamp: number;
	// Range to play from the underlying AudioBuffer.
	sourceOffsetInSeconds: number;
	sourceDurationInSeconds: number;
};

export async function* makeIteratorWithPriming({
	audioSink,
	timeToSeek,
	maximumTimestamp,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
}): AsyncGenerator<AudioBufferSlice, void, unknown> {
	let resumeTime = timeToSeek;
	let retriedWithoutProgress = false;
	while (true) {
		const iterator = audioSink.buffers(
			Math.max(0, resumeTime - AUDIO_PRIMING_SECONDS),
			maximumTimestamp,
		);
		try {
			for await (const buffer of iterator) {
				const sourceStart = Math.max(buffer.timestamp, resumeTime);
				const sourceEnd = Math.min(
					buffer.timestamp + buffer.duration,
					maximumTimestamp,
				);

				if (sourceEnd <= sourceStart) {
					continue;
				}

				// Preserve queued audio and resume after its last delivered slice.
				resumeTime = sourceEnd;
				retriedWithoutProgress = false;
				yield {
					buffer,
					timelineTimestamp: sourceStart,
					sourceOffsetInSeconds: sourceStart - buffer.timestamp,
					sourceDurationInSeconds: sourceEnd - sourceStart,
				};
			}

			return;
		} catch (error) {
			if (!isCodecReclaimedError(error) || retriedWithoutProgress) {
				throw error;
			}

			retriedWithoutProgress = true;
		} finally {
			await iterator.return().catch(() => undefined);
		}
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
	AudioBufferSlice,
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
			const timelineTimestamp =
				passBaseTimestamp + (item.timelineTimestamp - passStartInSeconds);
			const sourceDurationInSeconds = Math.min(
				item.sourceDurationInSeconds,
				maximumContinuousTimestamp - timelineTimestamp,
			);

			if (sourceDurationInSeconds <= 0) {
				return;
			}

			yield {
				...item,
				timelineTimestamp,
				sourceDurationInSeconds,
			};

			if (
				timelineTimestamp + sourceDurationInSeconds >=
				maximumContinuousTimestamp
			) {
				return;
			}
		}

		if (!yieldedInPass && passStartInSeconds === loopStartInSeconds) {
			return;
		}

		passBaseTimestamp += segmentEndInSeconds - passStartInSeconds;
		passStartInSeconds = loopStartInSeconds;
	}
}
