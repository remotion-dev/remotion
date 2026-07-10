import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeIteratorWithPriming} from '../make-iterator-with-priming';

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
		{buffer: WrappedAudioBuffer; timestamp: number},
		void,
		unknown
	>,
	count: number,
) => {
	const chunks: {timestamp: number; rawTimestamp: number}[] = [];
	for await (const chunk of iterator) {
		chunks.push({
			timestamp: chunk.timestamp,
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
	const iterator = makeIteratorWithPriming({
		audioSink: makeMockAudioSink(10),
		timeToSeek: 0,
		maximumTimestamp: 10,
		loop: true,
		loopStartInSeconds: 0,
		playbackRate: 1,
		sequenceDurationInSeconds: 100,
	});

	const chunks = await collect(iterator, 30);

	// Continuous timeline: 0, 1, ..., 29 with no wraps and no jumps
	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(30).fill(0).map((_, i) => i),
	);

	// The underlying media chunk restarts from the beginning at each iteration
	expect(chunks.map((c) => c.rawTimestamp)).toEqual(
		new Array(30).fill(0).map((_, i) => i % 10),
	);
});

test('seeking into the middle of a loop must replay the full segment on later iterations', async () => {
	const iterator = makeIteratorWithPriming({
		audioSink: makeMockAudioSink(10),
		timeToSeek: 4,
		maximumTimestamp: 10,
		loop: true,
		loopStartInSeconds: 0,
		playbackRate: 1,
		sequenceDurationInSeconds: 100,
	});

	const chunks = await collect(iterator, 26);

	// First pass covers the rest of the segment: raw 4..9
	expect(chunks.slice(0, 6).map((c) => c.rawTimestamp)).toEqual([
		4, 5, 6, 7, 8, 9,
	]);
	// Later passes replay the full segment from the loop start, not from the
	// seek position
	expect(chunks.slice(6, 16).map((c) => c.rawTimestamp)).toEqual([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
	]);
	expect(chunks.slice(16, 26).map((c) => c.rawTimestamp)).toEqual([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
	]);

	// Timestamps stay continuous starting from the seek time
	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(26).fill(0).map((_, i) => 4 + i),
	);
});

test('looped audio with trimBefore must replay the trimmed segment', async () => {
	// Loop segment is [3s, 10s] (e.g. trimBefore=90 @ 30fps), seek lands at 5s
	const iterator = makeIteratorWithPriming({
		audioSink: makeMockAudioSink(10),
		timeToSeek: 5,
		maximumTimestamp: 10,
		loop: true,
		loopStartInSeconds: 3,
		playbackRate: 1,
		sequenceDurationInSeconds: 100,
	});

	const chunks = await collect(iterator, 19);

	// First pass: raw 5..9, later passes: raw 3..9
	expect(chunks.map((c) => c.rawTimestamp)).toEqual([
		5, 6, 7, 8, 9, 3, 4, 5, 6, 7, 8, 9, 3, 4, 5, 6, 7, 8, 9,
	]);

	// Continuous timeline from the seek position
	expect(chunks.map((c) => c.timestamp)).toEqual(
		new Array(19).fill(0).map((_, i) => 5 + i),
	);
});

test('looping iterator must stop when the sequence duration is reached', async () => {
	const iterator = makeIteratorWithPriming({
		audioSink: makeMockAudioSink(10),
		timeToSeek: 0,
		maximumTimestamp: 10,
		loop: true,
		loopStartInSeconds: 0,
		playbackRate: 1,
		sequenceDurationInSeconds: 25,
	});

	const chunks = await collect(iterator, 1000);

	// 25 seconds of audio: chunks 0..24, then the iterator ends
	expect(chunks.length).toBe(25);
	expect(chunks[chunks.length - 1].timestamp).toBe(24);
});
