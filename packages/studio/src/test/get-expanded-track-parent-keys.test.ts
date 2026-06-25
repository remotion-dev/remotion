import {expect, test} from 'bun:test';
import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequenceNodePath, SequencePropsSubscriptionKey} from 'remotion';
import {getExpandedTrackParentKeys} from '../helpers/get-expanded-track-parent-keys';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath,
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys: [],
});

const makeNodePathInfo = (
	nodePath: SequenceNodePath,
	auxiliaryKeys: string[],
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeKey(nodePath),
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
});

const expandedKey = (
	subscriptionKey: SequencePropsSubscriptionKey,
	auxiliaryKeys: string[],
) =>
	[
		stringifySequenceExpandedRowKey(subscriptionKey),
		auxiliaryKeys.join('.'),
		0,
	].join('.');

test('expands regular parent rows for nested sequence props', () => {
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['layout', 'position', 'x'],
	);

	expect(getExpandedTrackParentKeys(nodePathInfo)).toEqual([
		expandedKey(nodePathInfo.sequenceSubscriptionKey, []),
		expandedKey(nodePathInfo.sequenceSubscriptionKey, ['layout']),
		expandedKey(nodePathInfo.sequenceSubscriptionKey, ['layout', 'position']),
	]);
});

test('preserves a collapsed effect row when selecting one of its props', () => {
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);

	expect(getExpandedTrackParentKeys(nodePathInfo)).toEqual([
		expandedKey(nodePathInfo.sequenceSubscriptionKey, []),
		expandedKey(nodePathInfo.sequenceSubscriptionKey, ['effects']),
	]);
});
