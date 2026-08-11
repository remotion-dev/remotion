import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';
import {expect, test} from 'vitest';
import {
	getDurationOfNode,
	getTrimStartForAudioNode,
} from '../audio/get-scheduled-time';
import {
	makeIteratorWithPriming,
	makeLoopingIterator,
} from '../make-iterator-with-priming';

const CHUNK_DURATION = 1;

// Yields 1-second chunks like a real AudioBufferSink, including the chunk
// that straddles the requested start time.
const makeMockAudioSink = (mediaDurationInSeconds: number) => {
	return {
		async *buffers(start: number, end: number) {
			const firstChunk = Math.max(0, Math.floor(start));
			const lastChunk = Math.min(mediaDurationInSeconds, end);
			for (let i = firstChunk; i < lastChunk; i += CHUNK_DURATION) {
				yield {
					timestamp: i,
					duration: CHUNK_DURATION,
					buffer: null,
				} as unknown as WrappedAudioBuffer;
			}
		},
	} as unknown as AudioBufferSink;
};

const collect = async (
	iterator: AsyncGenerator<
		{buffer: WrappedAudioBuffer; timelineTimestamp: number},
		void,
		unknown
	>,
	count: number,
) => {
	const chunks: {timestamp: number; rawTimestamp: number}[] = [];
	for await (const chunk of iterator) {
		chunks.push({
			timestamp: chunk.timelineTimestamp,
			rawTimestamp: chunk.buffer.timestamp,
		});
		if (chunks.length >= count) {
			break;
		}
	}

	return chunks;
};

// https://github.com/remotion-dev/remotion/issues/8922
test('looped audio timestamps must continue monotonically across loop iterations', async () => {
	const iterator = makeLoopingIterator({
		audioSink: makeMockAudioSink(10),
		seekTimeInSeconds: 0,
		segmentEndInSeconds: 10,
		loopStartInSeconds: 0,
		maximumContinuousTimestamp: 100,
	});

	const chunks = await collect(iterator, 30);

	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(30).fill(0).map((_, i) => i),
	);
	expect(chunks.map((c) => c.rawTimestamp)).toEqual(
		new Array(30).fill(0).map((_, i) => i % 10),
	);
});

test('seeking into the middle of a loop must replay the full segment on later iterations', async () => {
	const iterator = makeLoopingIterator({
		audioSink: makeMockAudioSink(10),
		seekTimeInSeconds: 4,
		segmentEndInSeconds: 10,
		loopStartInSeconds: 0,
		maximumContinuousTimestamp: 100,
	});

	const chunks = await collect(iterator, 26);

	expect(chunks.slice(0, 6).map((c) => c.rawTimestamp)).toEqual([
		4, 5, 6, 7, 8, 9,
	]);
	expect(chunks.slice(6, 16).map((c) => c.rawTimestamp)).toEqual([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
	]);
	expect(chunks.slice(16, 26).map((c) => c.rawTimestamp)).toEqual([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
	]);
	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(26).fill(0).map((_, i) => 4 + i),
	);
});

test('looped audio with trimBefore must replay the trimmed segment', async () => {
	const iterator = makeLoopingIterator({
		audioSink: makeMockAudioSink(10),
		seekTimeInSeconds: 5,
		segmentEndInSeconds: 10,
		loopStartInSeconds: 3,
		maximumContinuousTimestamp: 100,
	});

	const chunks = await collect(iterator, 19);

	expect(chunks.map((c) => c.rawTimestamp)).toEqual([
		5, 6, 7, 8, 9, 3, 4, 5, 6, 7, 8, 9, 3, 4, 5, 6, 7, 8, 9,
	]);
	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(19).fill(0).map((_, i) => 5 + i),
	);
});

test('looping iterator must stop at the manager-provided continuous timestamp', async () => {
	const iterator = makeLoopingIterator({
		audioSink: makeMockAudioSink(10),
		seekTimeInSeconds: 4,
		segmentEndInSeconds: 10,
		loopStartInSeconds: 0,
		// Equivalent to a 3-second sequence at playbackRate=2, calculated by
		// audioIteratorManager rather than by the source generator.
		maximumContinuousTimestamp: 10,
	});

	const chunks = await collect(iterator, 1000);
	expect(chunks.map((chunk) => chunk.timestamp)).toEqual([4, 5, 6, 7, 8, 9]);
});

test('one-pass iterator does not wrap', async () => {
	const iterator = makeIteratorWithPriming({
		audioSink: makeMockAudioSink(10),
		timeToSeek: 8,
		maximumTimestamp: 10,
	});

	const chunks = await collect(iterator, 1000);
	expect(chunks.map((chunk) => chunk.rawTimestamp)).toEqual([8, 9]);
});

test('scheduler trimming is additional to the source slice offset', () => {
	const sourceOffsetInSeconds = 0.013;
	const offset = getTrimStartForAudioNode({
		mediaTimestamp: 3,
		sequenceStartTime: 3.002,
		targetTime: -0.003,
		combinedPlaybackRate: 2,
		sourceStartOffsetInSeconds: sourceOffsetInSeconds,
	});

	expect(offset).toBeCloseTo(0.021);
	expect(
		getDurationOfNode({
			sourceDurationInSeconds: 0.03,
			sourceOffsetInSeconds,
			offset,
		}),
	).toBeCloseTo(0.022);
});

test('boundary buffers are represented as source slices on every pass', async () => {
	const crossingBufferSink = {
		async *buffers(_start: number, _end: number) {
			yield {
				timestamp: 2.987,
				duration: 0.021,
				buffer: null,
			} as unknown as WrappedAudioBuffer;
			yield {
				timestamp: 3.008,
				duration: 0.021,
				buffer: null,
			} as unknown as WrappedAudioBuffer;
		},
	} as unknown as AudioBufferSink;

	const iterator = makeLoopingIterator({
		audioSink: crossingBufferSink,
		seekTimeInSeconds: 3,
		loopStartInSeconds: 3,
		segmentEndInSeconds: 3.02,
		maximumContinuousTimestamp: 3.04,
	});

	const first = await iterator.next();
	const second = await iterator.next();
	const third = await iterator.next();

	expect(first.value?.timelineTimestamp).toBe(3);
	expect(first.value?.sourceOffsetInSeconds).toBeCloseTo(0.013);
	expect(first.value?.sourceDurationInSeconds).toBeCloseTo(0.008);
	expect(second.value?.timelineTimestamp).toBeCloseTo(3.008);
	expect(second.value?.sourceOffsetInSeconds).toBe(0);
	expect(second.value?.sourceDurationInSeconds).toBeCloseTo(0.012);
	expect(third.value?.timelineTimestamp).toBeCloseTo(3.02);
	expect(third.value?.sourceOffsetInSeconds).toBeCloseTo(0.013);
	expect(third.value?.sourceDurationInSeconds).toBeCloseTo(0.008);
});
