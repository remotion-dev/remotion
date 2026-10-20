import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropStatusKeyframed} from 'remotion';
import {getKeyframeSegments} from '../keyframe-easing';
import {getTimelineKeyframes} from '../keyframe-frames';

test('easing segments connect adjacent display keyframes', () => {
	const status: CanUpdateSequencePropStatusKeyframed = {
		status: 'keyframed',
		keyframeDisplayOffsetAdjustment: null,
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 2},
			{frame: 30, value: 3},
			{frame: 60, value: 4},
		],
		easing: [{type: 'linear'}, {type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	};

	expect(getKeyframeSegments(getTimelineKeyframes(status, 30))).toEqual([
		{segmentIndex: 0, fromFrame: 30, toFrame: 60},
		{segmentIndex: 1, fromFrame: 60, toFrame: 90},
	]);
});
