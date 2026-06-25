import {expect, test} from 'bun:test';
import {getAnimationItemSelectionForSourceFrame} from '../components/Timeline/get-animation-item-selection-for-frame';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const nodePathInfo = {
	sequenceSubscriptionKey: {
		absolutePath: '/tmp/test.tsx',
	},
	auxiliaryKeys: ['controls', 'radius'],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
} as SequenceNodePathInfo;

test('selects the keyframe when the playhead is on a keyframe', () => {
	expect(
		getAnimationItemSelectionForSourceFrame({
			includeEasings: true,
			keyframeDisplayOffset: 100,
			keyframes: [{frame: 10}, {frame: 30}],
			nodePathInfo,
			sourceFrame: 10,
		}),
	).toEqual({
		type: 'keyframe',
		nodePathInfo,
		frame: 110,
	});
});

test('selects the easing when the playhead is between two keyframes', () => {
	expect(
		getAnimationItemSelectionForSourceFrame({
			includeEasings: true,
			keyframeDisplayOffset: 100,
			keyframes: [{frame: 10}, {frame: 30}, {frame: 50}],
			nodePathInfo,
			sourceFrame: 35,
		}),
	).toEqual({
		type: 'easing',
		nodePathInfo,
		fromFrame: 130,
		toFrame: 150,
		segmentIndex: 1,
	});
});

test('does not select an easing when easing editing is unavailable', () => {
	expect(
		getAnimationItemSelectionForSourceFrame({
			includeEasings: false,
			keyframeDisplayOffset: 100,
			keyframes: [{frame: 10}, {frame: 30}],
			nodePathInfo,
			sourceFrame: 20,
		}),
	).toBe(null);
});

test('selects the first keyframe before the keyframe chain', () => {
	expect(
		getAnimationItemSelectionForSourceFrame({
			includeEasings: true,
			keyframeDisplayOffset: 100,
			keyframes: [{frame: 10}, {frame: 30}],
			nodePathInfo,
			sourceFrame: 0,
		}),
	).toEqual({
		type: 'keyframe',
		nodePathInfo,
		frame: 110,
	});
});

test('selects the last keyframe after the keyframe chain', () => {
	expect(
		getAnimationItemSelectionForSourceFrame({
			includeEasings: true,
			keyframeDisplayOffset: 100,
			keyframes: [{frame: 10}, {frame: 30}],
			nodePathInfo,
			sourceFrame: 40,
		}),
	).toEqual({
		type: 'keyframe',
		nodePathInfo,
		frame: 130,
	});
});
