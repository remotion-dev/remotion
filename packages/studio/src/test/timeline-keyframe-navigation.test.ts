import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {
	shouldShowTimelineKeyframeControls,
	shouldShowTimelineKeyframeNavigation,
} from '../components/Timeline/TimelineKeyframeControls';

test('timeline keyframe controls visibility follows property selection or keyframed status', () => {
	const staticStatus: CanUpdateSequencePropStatus = {
		status: 'static',
		keyframeDisplayOffsetAdjustment: null,
		codeValue: 1,
	};
	const keyframedStatus: CanUpdateSequencePropStatus = {
		status: 'keyframed',
		keyframeDisplayOffsetAdjustment: null,
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 10, value: 1}],
		easing: [],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	};
	const computedStatus: CanUpdateSequencePropStatus = {status: 'computed'};

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
	expect(
		shouldShowTimelineKeyframeControls({
			propStatus: computedStatus,
			selected: true,
			keyframable: true,
		}),
	).toBe(true);
});

test('keyframe navigation visibility follows property selection or keyframed status', () => {
	const staticStatus: CanUpdateSequencePropStatus = {
		status: 'static',
		keyframeDisplayOffsetAdjustment: null,
		codeValue: 1,
	};
	const keyframedStatus: CanUpdateSequencePropStatus = {
		status: 'keyframed',
		keyframeDisplayOffsetAdjustment: null,
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 10, value: 1}],
		easing: [],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	};
	const computedStatus: CanUpdateSequencePropStatus = {status: 'computed'};

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
	expect(
		shouldShowTimelineKeyframeNavigation({
			propStatus: computedStatus,
			selected: true,
		}),
	).toBe(false);
});
