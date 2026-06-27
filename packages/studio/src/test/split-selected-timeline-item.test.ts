import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatus,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {getTimelineSequenceSplitEligibility} from '../components/Timeline/split-selected-timeline-item';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/tmp/Comp.tsx',
	nodePath,
	sequenceKeys: [],
	effectKeys: [],
});

const makeNodePathInfo = (
	nodePath: SequenceNodePath,
	numberOfSequencesWithThisNodePath = 1,
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeKey(nodePath),
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath,
	supportsEffects: true,
});

const makeSequence = (overrides: Partial<TSequence> = {}): TSequence =>
	({
		from: 10,
		duration: 50,
		isInsideSeries: false,
		...overrides,
	}) as TSequence;

const staticNumber = (value: number): CanUpdateSequencePropStatus => ({
	status: 'static',
	codeValue: value,
});

test('getTimelineSequenceSplitEligibility accepts an editable sequence in range', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0]);

	expect(
		getTimelineSequenceSplitEligibility({
			selection: {type: 'sequence', nodePathInfo},
			sequence: makeSequence(),
			splitFrame: 30,
			propStatuses: {
				from: staticNumber(10),
				durationInFrames: staticNumber(50),
				trimBefore: staticNumber(0),
			},
		}),
	).toEqual({
		canSplit: true,
		nodePathInfo,
	});
});

test('getTimelineSequenceSplitEligibility rejects unsupported split positions', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0]);
	const selection = {type: 'sequence' as const, nodePathInfo};

	expect(
		getTimelineSequenceSplitEligibility({
			selection,
			sequence: makeSequence(),
			splitFrame: 10,
		}).canSplit,
	).toBe(false);
	expect(
		getTimelineSequenceSplitEligibility({
			selection,
			sequence: makeSequence(),
			splitFrame: 60,
		}).canSplit,
	).toBe(false);
	expect(
		getTimelineSequenceSplitEligibility({
			selection,
			sequence: makeSequence(),
			splitFrame: 9,
		}).canSplit,
	).toBe(false);
	expect(
		getTimelineSequenceSplitEligibility({
			selection,
			sequence: makeSequence(),
			splitFrame: 10.5,
		}).canSplit,
	).toBe(false);
});

test('getTimelineSequenceSplitEligibility rejects non-editable sequence shapes', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], 2);
	const selection = {type: 'sequence' as const, nodePathInfo};

	expect(
		getTimelineSequenceSplitEligibility({
			selection,
			sequence: makeSequence(),
			splitFrame: 30,
		}).canSplit,
	).toBe(false);
	expect(
		getTimelineSequenceSplitEligibility({
			selection: {
				type: 'sequence',
				nodePathInfo: makeNodePathInfo(['body', 1]),
			},
			sequence: makeSequence({isInsideSeries: true}),
			splitFrame: 30,
		}).canSplit,
	).toBe(false);
});

test('getTimelineSequenceSplitEligibility rejects dynamic timing props', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0]);

	expect(
		getTimelineSequenceSplitEligibility({
			selection: {type: 'sequence', nodePathInfo},
			sequence: makeSequence(),
			splitFrame: 30,
			propStatuses: {
				from: {status: 'computed'},
			},
		}).canSplit,
	).toBe(false);
});
