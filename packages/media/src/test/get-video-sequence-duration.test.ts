import {expect, test} from 'vitest';
import {getVideoSequenceDuration} from '../video/get-video-sequence-duration';

const getDuration = ({
	durationInFrames,
	loop = false,
	playbackRate = 1,
	trimAfter,
	trimBefore,
}: {
	readonly durationInFrames?: number;
	readonly loop?: boolean;
	readonly playbackRate?: number;
	readonly trimAfter?: number;
	readonly trimBefore?: number;
}) => {
	return getVideoSequenceDuration({
		durationInFrames,
		loop,
		playbackRate,
		trimAfter,
		trimBefore,
	});
};

test('leaves the sequence unbounded by default', () => {
	expect(getDuration({})).toBeUndefined();
});

test('preserves an explicit duration', () => {
	expect(getDuration({durationInFrames: 120})).toBe(120);
});

test('trimBefore alone does not bound the sequence', () => {
	expect(getDuration({trimBefore: 30})).toBeUndefined();
});

test('trimAfter bounds the sequence to the trimmed media duration', () => {
	expect(getDuration({trimBefore: 30, trimAfter: 150})).toBe(120);
	expect(getDuration({trimBefore: 30, trimAfter: 150, playbackRate: 2})).toBe(
		60,
	);
});

test('uses the shorter of trimAfter and an explicit duration', () => {
	expect(
		getDuration({
			durationInFrames: 80,
			trimBefore: 30,
			trimAfter: 150,
		}),
	).toBe(80);
	expect(
		getDuration({
			durationInFrames: 180,
			trimBefore: 30,
			trimAfter: 150,
		}),
	).toBe(120);
});

test('loop keeps the sequence unbounded despite trimAfter', () => {
	expect(
		getDuration({loop: true, trimBefore: 30, trimAfter: 150}),
	).toBeUndefined();
	expect(
		getDuration({
			durationInFrames: 180,
			loop: true,
			trimBefore: 30,
			trimAfter: 150,
		}),
	).toBe(180);
});
