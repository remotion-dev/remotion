import type {AudioSample} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeAudioCache} from '../audio-extraction/audio-cache';

type AudioSampleFormat = AudioSample['format'];

const makeSample = ({
	timestamp,
	format = 'f32',
	numberOfFrames = 1024,
	numberOfChannels = 2,
}: {
	timestamp: number;
	format?: AudioSampleFormat;
	numberOfFrames?: number;
	numberOfChannels?: number;
}) =>
	({
		timestamp,
		duration: 0.02,
		format,
		numberOfFrames,
		numberOfChannels,
		close: () => undefined,
	}) as unknown as AudioSample;

test('cache size is measured in bytes, not timestamps', () => {
	const cache = makeAudioCache();

	// Two identical samples that happen to sit far apart in the timeline. Their
	// memory footprint is the same, so the reported size must be too.
	cache.addFrame(makeSample({timestamp: 1}));
	cache.addFrame(makeSample({timestamp: 3600}));

	const bytesPerSample = 1024 * 2 * 4;
	expect(cache.getTotalSize()).toBe(bytesPerSample * 2);

	// The old implementation summed the timestamps, which would give 3601.
	expect(cache.getTotalSize()).not.toBe(3601);
});

test('size does not depend on where in the timeline the samples are', () => {
	const early = makeAudioCache();
	early.addFrame(makeSample({timestamp: 0}));
	early.addFrame(makeSample({timestamp: 0.02}));

	const late = makeAudioCache();
	late.addFrame(makeSample({timestamp: 5000}));
	late.addFrame(makeSample({timestamp: 5000.02}));

	expect(late.getTotalSize()).toBe(early.getTotalSize());
});

test('size accounts for sample format', () => {
	const f32 = makeAudioCache();
	f32.addFrame(makeSample({timestamp: 0, format: 'f32'}));

	const s16 = makeAudioCache();
	s16.addFrame(makeSample({timestamp: 0, format: 's16'}));

	expect(f32.getTotalSize()).toBe(1024 * 2 * 4);
	expect(s16.getTotalSize()).toBe(1024 * 2 * 2);
});

test('size accounts for channel count and frame count', () => {
	const cache = makeAudioCache();
	cache.addFrame(
		makeSample({timestamp: 0, numberOfChannels: 6, numberOfFrames: 2048}),
	);

	expect(cache.getTotalSize()).toBe(2048 * 6 * 4);
});

test('an empty cache has no size', () => {
	expect(makeAudioCache().getTotalSize()).toBe(0);
});
