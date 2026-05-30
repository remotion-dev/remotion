import {expect, test} from 'bun:test';
import type {SequenceNodePath, SequencePropsSubscriptionKey} from 'remotion';
import {isDuplicatableSequenceRowSelection} from '../components/Timeline/duplicate-selected-timeline-item';
import {
	ENABLE_OUTLINES,
	getSelectableTimelineSequenceSelections,
	getTimelineSequenceSelectionKey,
	SELECTION_ENABLED,
	TIMELINE_TOP_DRAG,
} from '../components/Timeline/TimelineSelection';
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
});

test('Timeline selection should stay disabled until released publicly', () => {
	expect(SELECTION_ENABLED).toBe(false);
});

test('Timeline top drag should not be enabled', () => {
	expect(TIMELINE_TOP_DRAG).toBe(false);
});

test('Timeline outlines should not be enabled', () => {
	expect(ENABLE_OUTLINES).toBe(false);
});

test('Cmd+A selection only targets selectable timeline sequences', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 1], ['effects', '0']);

	expect(
		getSelectableTimelineSequenceSelections([
			{nodePathInfo: null},
			{nodePathInfo: sequenceNodePathInfo},
			{nodePathInfo: effectNodePathInfo},
		]),
	).toEqual([
		{
			type: 'row',
			nodePathInfo: sequenceNodePathInfo,
		},
	]);
});

test('Cmd+D only duplicates selected timeline sequence rows', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 1], ['effects', '0']);

	expect(
		[
			{type: 'row' as const, nodePathInfo: sequenceNodePathInfo},
			{type: 'row' as const, nodePathInfo: effectNodePathInfo},
			{
				type: 'keyframe' as const,
				nodePathInfo: sequenceNodePathInfo,
				frame: 12,
			},
		].filter(isDuplicatableSequenceRowSelection),
	).toEqual([
		{
			type: 'row',
			nodePathInfo: sequenceNodePathInfo,
		},
	]);
});

test('Child timeline selections resolve to the parent sequence selection key', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 0], ['effects', '0']);
	const propNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);

	expect(getTimelineSequenceSelectionKey(effectNodePathInfo)).toBe(
		getTimelineSequenceSelectionKey(sequenceNodePathInfo),
	);
	expect(getTimelineSequenceSelectionKey(propNodePathInfo)).toBe(
		getTimelineSequenceSelectionKey(sequenceNodePathInfo),
	);
});
