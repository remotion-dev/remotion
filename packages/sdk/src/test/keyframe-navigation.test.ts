import {expect, test} from 'bun:test';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from '../keyframe-navigation';

const keyframes = [{frame: 10}, {frame: 30}, {frame: 90}];
const durationInFrames = 100;

test('getPreviousKeyframeDisplayFrame returns the nearest earlier keyframe', () => {
	expect(getPreviousKeyframeDisplayFrame(keyframes, 0, durationInFrames)).toBe(
		null,
	);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 10, durationInFrames)).toBe(
		null,
	);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 11, durationInFrames)).toBe(
		10,
	);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 30, durationInFrames)).toBe(
		10,
	);
	expect(
		getPreviousKeyframeDisplayFrame(keyframes, 100, durationInFrames),
	).toBe(90);
});

test('getNextKeyframeDisplayFrame returns the nearest later keyframe', () => {
	expect(getNextKeyframeDisplayFrame(keyframes, 0, durationInFrames)).toBe(10);
	expect(getNextKeyframeDisplayFrame(keyframes, 10, durationInFrames)).toBe(30);
	expect(getNextKeyframeDisplayFrame(keyframes, 29, durationInFrames)).toBe(30);
	expect(getNextKeyframeDisplayFrame(keyframes, 90, durationInFrames)).toBe(
		null,
	);
	expect(getNextKeyframeDisplayFrame(keyframes, 100, durationInFrames)).toBe(
		null,
	);
});

test('keyframe navigation skips frames outside the timeline range', () => {
	const offTimelineKeyframes = [
		{frame: 40},
		{frame: -10},
		{frame: 100},
		{frame: 120},
		{frame: 20},
	];

	expect(getPreviousKeyframeDisplayFrame(offTimelineKeyframes, 30, 100)).toBe(
		20,
	);
	expect(getNextKeyframeDisplayFrame(offTimelineKeyframes, 30, 100)).toBe(40);
	expect(getPreviousKeyframeDisplayFrame(offTimelineKeyframes, 10, 100)).toBe(
		null,
	);
	expect(getNextKeyframeDisplayFrame(offTimelineKeyframes, 50, 100)).toBe(null);
	expect(getPreviousKeyframeDisplayFrame(offTimelineKeyframes, 120, 100)).toBe(
		40,
	);
});

test('keyframe navigation lands on whole frames for fractional keyframes', () => {
	// <Sequence playbackRate={2}> maps source keyframes 0, 15, 30 to 0, 7.5, 15
	const fractionalKeyframes = [{frame: 0}, {frame: 7.5}, {frame: 15}];

	expect(getNextKeyframeDisplayFrame(fractionalKeyframes, 0, 60)).toBe(8);
	expect(getPreviousKeyframeDisplayFrame(fractionalKeyframes, 15, 60)).toBe(7);
	expect(getNextKeyframeDisplayFrame(fractionalKeyframes, 7, 60)).toBe(8);
	expect(getNextKeyframeDisplayFrame(fractionalKeyframes, 8, 60)).toBe(15);
	expect(getPreviousKeyframeDisplayFrame(fractionalKeyframes, 8, 60)).toBe(7);
	expect(getPreviousKeyframeDisplayFrame(fractionalKeyframes, 7, 60)).toBe(0);
});

test('keyframe navigation does not snap past the last frame', () => {
	expect(getNextKeyframeDisplayFrame([{frame: 59.5}], 58, 60)).toBe(59);
	expect(getNextKeyframeDisplayFrame([{frame: 59.5}], 59, 60)).toBe(null);
});

test('hasKeyframeAtSourceFrame checks source frame membership', () => {
	expect(hasKeyframeAtSourceFrame(keyframes, 10)).toBe(true);
	expect(hasKeyframeAtSourceFrame(keyframes, 11)).toBe(false);
});
