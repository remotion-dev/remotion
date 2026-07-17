import {expect, test} from 'bun:test';
import {makeFrameDatabaseKey, type FrameDatabaseKey} from '../frame-database';
import {
	calculateTimestampSlots,
	getBestCachedFrameKeyForTimestamp,
	getDurationOfOneFrame,
	MAX_TIME_DEVIATION,
	WEBCODECS_TIMESCALE,
} from '../render-frame-strip';

test('getBestCachedFrameKeyForTimestamp rejects frames beyond the max deviation', () => {
	const src = 'https://example.com/video.mp4';
	const keys: FrameDatabaseKey[] = [
		makeFrameDatabaseKey(src, 0),
		makeFrameDatabaseKey(src, WEBCODECS_TIMESCALE),
	];

	expect(
		getBestCachedFrameKeyForTimestamp({
			keys,
			timestamp: WEBCODECS_TIMESCALE * 0.5,
		}),
	).toBeNull();

	expect(
		getBestCachedFrameKeyForTimestamp({
			keys,
			timestamp: MAX_TIME_DEVIATION,
		}),
	).toBe(keys[0]);

	expect(
		getBestCachedFrameKeyForTimestamp({
			keys,
			timestamp: WEBCODECS_TIMESCALE + MAX_TIME_DEVIATION,
		}),
	).toBe(keys[1]);
});

test('getBestCachedFrameKeyForTimestamp picks the nearest frame within the threshold', () => {
	const src = 'https://example.com/video.mp4';
	const keys: FrameDatabaseKey[] = [
		makeFrameDatabaseKey(src, WEBCODECS_TIMESCALE * 0.9),
		makeFrameDatabaseKey(src, WEBCODECS_TIMESCALE * 1.02),
	];

	expect(
		getBestCachedFrameKeyForTimestamp({
			keys,
			timestamp: WEBCODECS_TIMESCALE,
		}),
	).toBe(keys[1]);
});

test('timestamp slots stay anchored when width stays proportional to duration', () => {
	const aspectRatio = 16 / 9;
	const frameHeight = 50;
	const pxPerSecond = 120;
	const fromSeconds = 31 / 30;
	const segmentDuration = 47 / 30;
	const visualizationWidth = segmentDuration * pxPerSecond;

	const slots = calculateTimestampSlots({
		visualizationWidth,
		fromSeconds,
		segmentDuration,
		aspectRatio,
		frameHeight,
	});

	const nextFromSeconds = 32 / 30;
	const nextSegmentDuration = 46 / 30;
	const nextSlots = calculateTimestampSlots({
		visualizationWidth: nextSegmentDuration * pxPerSecond,
		fromSeconds: nextFromSeconds,
		segmentDuration: nextSegmentDuration,
		aspectRatio,
		frameHeight,
	});

	const durationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth,
		aspectRatio,
		segmentDuration,
		frameHeight,
	});
	const nextDurationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth: nextSegmentDuration * pxPerSecond,
		aspectRatio,
		segmentDuration: nextSegmentDuration,
		frameHeight,
	});

	expect(nextDurationOfOneFrame).toBe(durationOfOneFrame);
	expect(
		nextSlots.filter((slot) => slots.includes(slot)).length,
	).toBeGreaterThan(0);
});
