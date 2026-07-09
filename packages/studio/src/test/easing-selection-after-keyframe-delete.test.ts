import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatusKeyframed,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {getEasingSelectionAfterKeyframeDelete} from '../components/Timeline/get-easing-selection-after-keyframe-delete';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const makeNodePathInfo = (
	nodePath: SequenceNodePath,
	auxiliaryKeys: string[],
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: {
		absolutePath: '/project/src/Comp.tsx',
		nodePath,
		sequenceKeys: ['from', 'durationInFrames'],
		effectKeys: [],
	} satisfies SequencePropsSubscriptionKey,
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
});

const keyframedStatus = {
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 0},
		{frame: 10, value: 0.5},
		{frame: 20, value: 1},
	],
	easing: [{type: 'linear'}, {type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
} satisfies CanUpdateSequencePropStatusKeyframed;

test('gets easing selection after deleting an in-between keyframe', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);

	expect(
		getEasingSelectionAfterKeyframeDelete({
			deletedSourceFrames: [10],
			keyframeDisplayOffset: 5,
			nodePathInfo,
			propStatus: keyframedStatus,
			timelinePosition: 15,
		}),
	).toEqual({
		type: 'easing',
		nodePathInfo,
		fromFrame: 5,
		toFrame: 25,
		segmentIndex: 0,
	});
});

test('does not select an easing after deleting an edge keyframe', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);

	expect(
		getEasingSelectionAfterKeyframeDelete({
			deletedSourceFrames: [0],
			keyframeDisplayOffset: 5,
			nodePathInfo,
			propStatus: keyframedStatus,
			timelinePosition: 5,
		}),
	).toBe(null);
});
