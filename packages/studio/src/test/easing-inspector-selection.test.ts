import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatusKeyframed,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {getEasingSelectionFromCurrentKeyframes} from '../components/InspectorPanel/easing-inspector-selection';
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

const makeKeyframedStatus = (
	keyframes: {readonly frame: number; readonly value: number}[],
): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes,
	easing: [{type: 'linear'}, {type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
});

test('derives easing selection endpoints from current keyframes', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);

	expect(
		getEasingSelectionFromCurrentKeyframes({
			keyframeDisplayOffset: 3,
			nodePathInfo,
			propStatus: makeKeyframedStatus([
				{frame: 0, value: 0},
				{frame: 14, value: 0.5},
				{frame: 30, value: 1},
			]),
			segmentIndex: 1,
		}),
	).toEqual({
		type: 'easing',
		nodePathInfo,
		fromFrame: 17,
		toFrame: 33,
		segmentIndex: 1,
	});
});

test('returns null when selected easing segment no longer exists', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);

	expect(
		getEasingSelectionFromCurrentKeyframes({
			keyframeDisplayOffset: 0,
			nodePathInfo,
			propStatus: makeKeyframedStatus([{frame: 0, value: 0}]),
			segmentIndex: 0,
		}),
	).toBe(null);
});
