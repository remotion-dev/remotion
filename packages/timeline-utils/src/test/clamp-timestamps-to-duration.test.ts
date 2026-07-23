import {expect, test} from 'bun:test';
import {clampTimestampsToDuration} from '../clamp-timestamps-to-duration';

test('clamps timestamps after the media duration to the final media instant', () => {
	expect(
		clampTimestampsToDuration({
			timestamps: [0, 0.5, 1, 2],
			durationInSeconds: 1,
		}),
	).toEqual([0, 0.5, 0.999999, 0.999999]);
});

test('does not clamp timestamps when the duration is unknown', () => {
	const timestamps = [0, 1, 2];
	expect(
		clampTimestampsToDuration({
			timestamps,
			durationInSeconds: null,
		}),
	).toEqual(timestamps);
});
