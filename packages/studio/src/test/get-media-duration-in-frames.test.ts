import {expect, test} from 'bun:test';
import {getMediaDurationInFrames} from '../helpers/get-media-duration-in-frames';

test('max media duration keeps subframe durations', () => {
	expect(
		getMediaDurationInFrames({
			durationInSeconds: 23.5 / 30,
			fps: 30,
		}),
	).toBe(23.5);
});

test('does not floor fractional media durations', () => {
	expect(
		getMediaDurationInFrames({
			durationInSeconds: 1.0166666667,
			fps: 30,
		}),
	).toBeGreaterThan(30);
});
