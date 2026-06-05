import {expect, test} from 'bun:test';
import {getTimelineDuration} from '../get-timeline-duration.js';

test('playbackRate 2.45 with 300 composition frames returns 300', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 2.45,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: null,
		loop: false,
	});

	expect(duration).toBe(300);
});

test('playbackRate 1 returns composition duration unchanged', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 1,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: null,
		loop: false,
	});

	expect(duration).toBe(300);
});

test('playbackRate 0.5 with 300 composition frames returns 300', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 0.5,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: null,
		loop: false,
	});

	expect(duration).toBe(300);
});

test('parentSequence caps the duration', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 1,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: 100,
		loop: false,
	});

	expect(duration).toBe(100);
});

test('parentSequence with subframe duration caps without truncation', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 1,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: 23.5,
		loop: false,
	});

	expect(duration).toBe(23.5);
});

test('subframe sequence duration is not truncated', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 10.920000000000016,
		playbackRate: 1,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: 10.920000000000016,
		loop: false,
	});

	expect(duration).toBe(10.92);
});

test('parentSequence with playbackRate 2.45 caps correctly', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 2.45,
		trimBefore: undefined,
		trimAfter: undefined,
		parentSequenceDurationInFrames: 100,
		loop: false,
	});

	expect(duration).toBe(245);
});

test('trimBefore is accounted for', () => {
	const duration = getTimelineDuration({
		compositionDurationInFrames: 300,
		playbackRate: 2.45,
		trimBefore: 30,
		trimAfter: undefined,
		parentSequenceDurationInFrames: null,
		loop: false,
	});

	expect(duration).toBe(300);
});
