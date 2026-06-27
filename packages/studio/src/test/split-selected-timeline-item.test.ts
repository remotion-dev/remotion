import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatus,
	PropStatuses,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {
	getTimelineSequenceSplitEligibility,
	shouldHandleTimelineDuplicateShortcut,
	shouldHandleTimelineSplitShortcut,
	splitSelectedTimelineItems,
} from '../components/Timeline/split-selected-timeline-item';
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
		trimBefore: null,
		duration: 50,
		id: 'sequence',
		displayName: 'Sequence',
		documentationLink: null,
		parent: null,
		rootId: 'root',
		showInTimeline: true,
		nonce: [[0, 0]],
		loopDisplay: undefined,
		getStack: () => null,
		premountDisplay: null,
		postmountDisplay: null,
		controls: {
			schema: {},
			currentRuntimeValueDotNotation: {},
			overrideId: 'override',
			supportsEffects: true,
			componentIdentity: null,
			componentName: 'Sequence',
		},
		refForOutline: null,
		effects: [],
		isInsideSeries: false,
		frozenFrame: null,
		type: 'sequence',
		...overrides,
	}) as unknown as TSequence;

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
	expect(
		getTimelineSequenceSplitEligibility({
			selection: {
				type: 'sequence',
				nodePathInfo: makeNodePathInfo(['body', 2]),
			},
			sequence: makeSequence({
				controls: {
					schema: {},
					currentRuntimeValueDotNotation: {},
					overrideId: 'override',
					supportsEffects: true,
					componentIdentity: 'dev.remotion.remotion.Solid',
					componentName: '<Solid>',
				},
			}),
			splitFrame: 30,
		}),
	).toEqual({
		canSplit: true,
		nodePathInfo: makeNodePathInfo(['body', 2]),
	});
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

test('Cmd+D and Cmd+Shift+D shortcut gates are mutually exclusive', () => {
	expect(shouldHandleTimelineDuplicateShortcut({shiftKey: false})).toBe(true);
	expect(shouldHandleTimelineDuplicateShortcut({shiftKey: true})).toBe(false);
	expect(shouldHandleTimelineSplitShortcut({shiftKey: false})).toBe(false);
	expect(shouldHandleTimelineSplitShortcut({shiftKey: true})).toBe(true);
});

test('splitSelectedTimelineItems splits the selected sequence at the playhead', async () => {
	const nodePathInfo = makeNodePathInfo(['body', 0]);
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(
			nodePathInfo.sequenceSubscriptionKey,
		)]: {
			canUpdate: true,
			props: {
				from: staticNumber(10),
				durationInFrames: staticNumber(50),
				trimBefore: staticNumber(0),
			},
			effects: [],
		},
	} satisfies PropStatuses;
	const splitCalls: {nodePathInfo: SequenceNodePathInfo; splitFrame: number}[] =
		[];

	const result = await splitSelectedTimelineItems({
		selections: [{type: 'sequence', nodePathInfo}],
		sequences: [makeSequence()],
		overrideIdsToNodePaths: {
			override: nodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses,
		splitFrame: 30,
		splitSequence: (options) => {
			splitCalls.push(options);
			return Promise.resolve(true);
		},
	});

	expect(result).toBe(true);
	expect(splitCalls).toEqual([{nodePathInfo, splitFrame: 30}]);
});
