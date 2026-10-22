import {expect, test} from 'bun:test';
import {
	getClippedVideoFrameTiming,
	getVideoProcessingProgress,
	rebaseVideoTimestamp,
} from '../video-timing';

test('rebases and clips variable-frame-rate video timing', () => {
	expect(
		rebaseVideoTimestamp({timestamp: 4.979, firstVideoTimestamp: 4.045}),
	).toBeCloseTo(0.934, 12);
	expect(
		getVideoProcessingProgress({
			timestamp: 10.125,
			duration: 0.125,
			firstVideoTimestamp: 10,
			durationInSeconds: 1,
		}),
	).toEqual({processedDurationInSeconds: 0.25, progress: 0.25});
	expect(
		getVideoProcessingProgress({
			timestamp: 2.9,
			duration: 0.2,
			firstVideoTimestamp: 2,
			durationInSeconds: 1,
		}),
	).toEqual({processedDurationInSeconds: 1, progress: 1});
	expect(
		getClippedVideoFrameTiming({
			timestamp: -0.5,
			duration: 0.25,
			videoStartTimestamp: 0,
			videoEndTimestamp: 1,
		}),
	).toBeNull();
	expect(
		getClippedVideoFrameTiming({
			timestamp: -0.25,
			duration: 0.5,
			videoStartTimestamp: 0,
			videoEndTimestamp: 1,
		}),
	).toEqual({timestamp: 0, duration: 0.25});
	expect(
		getClippedVideoFrameTiming({
			timestamp: 0.875,
			duration: 0.25,
			videoStartTimestamp: 0,
			videoEndTimestamp: 1,
		}),
	).toEqual({timestamp: 0.875, duration: 0.125});
});
