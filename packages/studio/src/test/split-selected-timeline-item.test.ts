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
import type {TimelineSelection} from '../components/Timeline/TimelineSelection';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {makeRuntimeValueStore} from './make-runtime-value-store';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/tmp/Comp.tsx',
	nodePath,
	sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
	effectKeys: [],
	videoConfigValues: null,
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
		showInTimeline: true,
		nonce: [[0, 0]],
		loopDisplay: undefined,
		getStack: () => null,
		premountDisplay: null,
		postmountDisplay: null,
		controls: {
			schema: {},
			runtimeValues: makeRuntimeValueStore({}),
			overrideId: 'override',
			supportsEffects: true,
			componentIdentity: null,
			componentName: 'Sequence',
		},
		refForOutline: null,
		effects: [],
		effectRuntimeValues: null,
		isInsideSeries: false,
		frozenFrame: null,
		type: 'sequence',
		...overrides,
	}) as unknown as TSequence;

const staticNumber = (value: number): CanUpdateSequencePropStatus => ({
	status: 'static',
	keyframeDisplayOffsetAdjustment: null,
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
					runtimeValues: makeRuntimeValueStore({}),
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

test('getTimelineSequenceSplitEligibility derives timing support from schema keys', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0]);
	const withoutFrom = {
		...nodePathInfo,
		sequenceSubscriptionKey: {
			...nodePathInfo.sequenceSubscriptionKey,
			sequenceKeys: ['durationInFrames', 'trimBefore'],
		},
	};

	expect(
		getTimelineSequenceSplitEligibility({
			selection: {type: 'sequence', nodePathInfo: withoutFrom},
			sequence: makeSequence(),
			splitFrame: 30,
		}),
	).toEqual({
		canSplit: false,
		reason: 'Sequence does not expose timing traits that can be split',
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
	const splitCalls: {
		nodePathInfos: SequenceNodePathInfo[];
		splitFrame: number;
	}[] = [];

	const result = await splitSelectedTimelineItems({
		selections: [{type: 'sequence', nodePathInfo}],
		sequences: [makeSequence()],
		overrideIdsToNodePaths: {
			override: nodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses,
		splitFrame: 30,
		splitSequences: (options) => {
			splitCalls.push(options);
			return Promise.resolve({mutationId: 'test', files: []});
		},
	});

	expect(result).toBe(true);
	expect(splitCalls).toEqual([{nodePathInfos: [nodePathInfo], splitFrame: 30}]);
});

test('splitSelectedTimelineItems batches eligible clips and skips ineligible clips', async () => {
	const first = makeNodePathInfo(['body', 0]);
	const second = makeNodePathInfo(['body', 1]);
	const third = makeNodePathInfo(['body', 2]);
	const propStatuses = Object.fromEntries(
		[first, second, third].map((nodePathInfo) => [
			Internals.makeSequencePropsSubscriptionKey(
				nodePathInfo.sequenceSubscriptionKey,
			),
			{
				canUpdate: true,
				props: {
					from: staticNumber(10),
					durationInFrames: staticNumber(50),
					trimBefore: staticNumber(0),
				},
				effects: [],
			},
		]),
	) as PropStatuses;
	const makeControls = (overrideId: string) => ({
		schema: {},
		runtimeValues: makeRuntimeValueStore({}),
		overrideId,
		supportsEffects: true,
		componentIdentity: null,
		componentName: 'Sequence',
	});
	const splitCalls: SequenceNodePathInfo[][] = [];
	const notifications: string[] = [];
	const selectedAfterSplit: (readonly TimelineSelection[])[] = [];

	const result = await splitSelectedTimelineItems({
		selections: [first, second, third].map((nodePathInfo) => ({
			type: 'sequence' as const,
			nodePathInfo,
		})),
		sequences: [
			makeSequence({controls: makeControls('first')}),
			makeSequence({controls: makeControls('second')}),
			makeSequence({
				from: 40,
				duration: 20,
				controls: makeControls('third'),
			}),
		],
		overrideIdsToNodePaths: {
			first: first.sequenceSubscriptionKey,
			second: second.sequenceSubscriptionKey,
			third: third.sequenceSubscriptionKey,
		},
		propStatuses,
		splitFrame: 30,
		splitSequences: ({nodePathInfos}) => {
			splitCalls.push(nodePathInfos);
			return Promise.resolve({
				mutationId: 'test',
				files: [
					{
						absolutePath: '/tmp/Comp.tsx',
						invalidatedNodePaths: [
							first.sequenceSubscriptionKey.nodePath,
							second.sequenceSubscriptionKey.nodePath,
						],
						remappings: [
							{oldNodePath: ['body', 1], newNodePath: ['body', 2]},
							{oldNodePath: ['body', 2], newNodePath: ['body', 4]},
						],
						restoredNodePaths: [],
					},
				],
			});
		},
		notify: (content) => notifications.push(content),
		onSplit: (selections) => selectedAfterSplit.push(selections),
	});

	expect(result).toBe(true);
	expect(splitCalls).toEqual([[first, second]]);
	expect(notifications).toEqual([
		'Skipped 1 selected clip that cannot be split',
	]);
	expect(
		selectedAfterSplit[0].map(
			(selection) => selection.type === 'sequence' && selection.nodePathInfo,
		),
	).toEqual([
		first,
		{
			...second,
			sequenceSubscriptionKey: {
				...second.sequenceSubscriptionKey,
				nodePath: ['body', 2],
			},
		},
		{
			...third,
			sequenceSubscriptionKey: {
				...third.sequenceSubscriptionKey,
				nodePath: ['body', 4],
			},
		},
	]);
});
