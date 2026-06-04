import {expect, test} from 'bun:test';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from '../components/Timeline/get-keyframe-navigation';

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

test('hasKeyframeAtSourceFrame checks source frame membership', () => {
	expect(hasKeyframeAtSourceFrame(keyframes, 10)).toBe(true);
	expect(hasKeyframeAtSourceFrame(keyframes, 11)).toBe(false);
});
