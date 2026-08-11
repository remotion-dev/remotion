import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from '../components/Timeline/get-keyframe-navigation';
import {
	shouldShowTimelineKeyframeControls,
	shouldShowTimelineKeyframeNavigation,
} from '../components/Timeline/TimelineKeyframeControls';

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

test('timeline keyframe controls visibility follows property selection or keyframed status', () => {
	const staticStatus: CanUpdateSequencePropStatus = {
		status: 'static',
		codeValue: 1,
	};
	const keyframedStatus: CanUpdateSequencePropStatus = {
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 10, value: 1}],
		easing: [],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	};

	expect(
		shouldShowTimelineKeyframeControls({
			propStatus: staticStatus,
			selected: false,
			keyframable: true,
		}),
	).toBe(false);
	expect(
		shouldShowTimelineKeyframeControls({
			propStatus: staticStatus,
			selected: true,
			keyframable: true,
		}),
	).toBe(true);
	expect(
		shouldShowTimelineKeyframeControls({
			propStatus: keyframedStatus,
			selected: false,
			keyframable: true,
		}),
	).toBe(true);
	expect(
		shouldShowTimelineKeyframeControls({
			propStatus: staticStatus,
			selected: true,
			keyframable: false,
		}),
	).toBe(false);
});

test('keyframe navigation visibility follows property selection or keyframed status', () => {
	const staticStatus: CanUpdateSequencePropStatus = {
		status: 'static',
		codeValue: 1,
	};
	const keyframedStatus: CanUpdateSequencePropStatus = {
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 10, value: 1}],
		easing: [],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	};

	expect(
		shouldShowTimelineKeyframeNavigation({
			propStatus: staticStatus,
			selected: false,
		}),
	).toBe(false);
	expect(
		shouldShowTimelineKeyframeNavigation({
			propStatus: staticStatus,
			selected: true,
		}),
	).toBe(true);
	expect(
		shouldShowTimelineKeyframeNavigation({
			propStatus: keyframedStatus,
			selected: false,
		}),
	).toBe(true);
});
