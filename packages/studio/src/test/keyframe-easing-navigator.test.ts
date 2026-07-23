import {expect, test} from 'bun:test';
import {
	getKeyframeEasingNavigatorItems,
	getNavigatorItemPlayheadFrame,
} from '../components/InspectorPanel/keyframe-easing-navigator-items';
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

test('builds alternating keyframe and easing navigator items', () => {
	const items = getKeyframeEasingNavigatorItems({
		includeEasings: true,
		keyframes: [{frame: 10}, {frame: 30}, {frame: 50}],
		nodePathInfo,
	});

	expect(items.map((item) => item.type)).toEqual([
		'keyframe',
		'easing',
		'keyframe',
		'easing',
		'keyframe',
	]);
	expect(items[1]?.selection).toEqual({
		type: 'easing',
		nodePathInfo,
		fromFrame: 10,
		toFrame: 30,
		segmentIndex: 0,
	});
	expect(items[3]?.selection).toEqual({
		type: 'easing',
		nodePathInfo,
		fromFrame: 30,
		toFrame: 50,
		segmentIndex: 1,
	});
});

test('omits easing navigator items when easing cannot be selected', () => {
	const items = getKeyframeEasingNavigatorItems({
		includeEasings: false,
		keyframes: [{frame: 10}, {frame: 30}, {frame: 50}],
		nodePathInfo,
	});

	expect(items.map((item) => item.selection)).toEqual([
		{
			type: 'keyframe',
			nodePathInfo,
			frame: 10,
		},
		{
			type: 'keyframe',
			nodePathInfo,
			frame: 30,
		},
		{
			type: 'keyframe',
			nodePathInfo,
			frame: 50,
		},
	]);
});

test('returns the keyframe frame as playhead target', () => {
	expect(
		getNavigatorItemPlayheadFrame({
			type: 'keyframe',
			selection: {
				type: 'keyframe',
				nodePathInfo,
				frame: 42,
			},
		}),
	).toBe(42);
});

test('returns the easing midpoint as playhead target', () => {
	expect(
		getNavigatorItemPlayheadFrame({
			type: 'easing',
			selection: {
				type: 'easing',
				nodePathInfo,
				fromFrame: 10,
				toFrame: 31,
				segmentIndex: 0,
			},
		}),
	).toBe(21);
});
