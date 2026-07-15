import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatusKeyframed,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals, type PropStatuses} from 'remotion';
import {findTrackForNodePathInfo} from '../components/Timeline/find-track-for-node-path-info';
import {getBoundedKeyframeDragDelta} from '../components/Timeline/get-bounded-keyframe-drag-delta';
import {getNodeKeyframes} from '../components/Timeline/get-node-keyframes';
import {getTimelineEasingSegments} from '../components/Timeline/get-timeline-easing-segments';
import {getTimelineKeyframes} from '../components/Timeline/get-timeline-keyframes';
import {getTimelineKeyframeDragKey} from '../components/Timeline/TimelineKeyframeDragState';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {
	getSchemaFieldGroup,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';

const getStack = () => null;

const makeNodePath = (id: string): SequencePropsSubscriptionKey => ({
	absolutePath: '/src/Composition.tsx',
	nodePath: [id],
	sequenceKeys: ['style.scale'],
	effectKeys: [],
});

const makeNodePathWithEffectKeys = (
	id: string,
	effectKeys: string[][],
): SequencePropsSubscriptionKey => ({
	...makeNodePath(id),
	effectKeys,
});

const makeControls = (
	overrideId: string,
): NonNullable<TSequence['controls']> => ({
	schema: {},
	currentRuntimeValueDotNotation: {},
	overrideId,
	supportsEffects: false,
	componentIdentity: null,
	componentName: '<Sequence>',
});

const makeSequence = ({
	id,
	from,
	trimBefore,
	parent = null,
	overrideId = null,
	nonce,
}: {
	id: string;
	from: number;
	trimBefore: number | null;
	parent?: string | null;
	overrideId?: string | null;
	nonce: number;
}): TSequence => ({
	type: 'sequence',
	from,
	trimBefore,
	duration: 120,
	id,
	displayName: id,
	documentationLink: null,
	parent,
	rootId: 'root',
	showInTimeline: true,
	nonce: [[0, nonce]],
	loopDisplay: undefined,
	getStack,
	refForOutline: null,
	isInsideSeries: false,
	premountDisplay: null,
	postmountDisplay: null,
	controls: overrideId ? makeControls(overrideId) : null,
	effects: [],
	frozenFrame: null,
});

const numberFieldSchema = {
	type: 'number',
	default: 1,
	hiddenFromList: false,
} as const;

const makeKeyframedStatus = (): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 2},
		{frame: 60, value: 4},
	],
	easing: [{type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
	output: undefined,
});

const makeSequenceFieldNode = (key: string): TimelineTreeNode => ({
	kind: 'field',
	label: key,
	nodePathInfo: {
		sequenceSubscriptionKey: makeNodePath('sequence'),
		auxiliaryKeys: ['controls', key],
		index: 0,
		numberOfSequencesWithThisNodePath: 1,
		supportsEffects: true,
	},
	field: {
		kind: 'sequence-field',
		key,
		description: undefined,
		typeName: 'number',
		rowHeight: 22,
		fieldSchema: numberFieldSchema,
		group: getSchemaFieldGroup(key),
	},
});

const makeEffectFieldNode = (
	key: string,
	effectIndex: number,
): TimelineTreeNode => ({
	kind: 'field',
	label: key,
	nodePathInfo: {
		sequenceSubscriptionKey: makeNodePath('sequence'),
		auxiliaryKeys: ['effects', String(effectIndex), key],
		index: 0,
		numberOfSequencesWithThisNodePath: 1,
		supportsEffects: true,
	},
	field: {
		kind: 'effect-field',
		key,
		description: undefined,
		typeName: 'number',
		rowHeight: 22,
		fieldSchema: numberFieldSchema,
		effectIndex,
		effectSchema: {
			[key]: numberFieldSchema,
		},
		group: getSchemaFieldGroup(key),
	},
});

const makePropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
): PropStatuses => ({
	[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
		canUpdate: true,
		props: {
			'style.scale': makeKeyframedStatus(),
		},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'blur',
				importPath: null,
				props: {
					amount: makeKeyframedStatus(),
				},
			},
		],
	},
});

test('keyframe display offsets follow the parent sequence context', () => {
	const timeline = calculateTimeline({
		sequences: [
			makeSequence({
				id: 'root-style',
				from: 30,
				trimBefore: null,
				overrideId: 'root-style',
				nonce: 0,
			}),
			makeSequence({id: 'parent', from: 30, trimBefore: null, nonce: 1}),
			makeSequence({
				id: 'child',
				from: 0,
				trimBefore: null,
				parent: 'parent',
				overrideId: 'child',
				nonce: 2,
			}),
			makeSequence({id: 'outer', from: 10, trimBefore: null, nonce: 3}),
			makeSequence({
				id: 'own-from',
				from: 20,
				trimBefore: null,
				parent: 'outer',
				overrideId: 'own-from',
				nonce: 4,
			}),
			makeSequence({
				id: 'grandchild',
				from: 0,
				trimBefore: null,
				parent: 'own-from',
				overrideId: 'grandchild',
				nonce: 5,
			}),
		],
		overrideIdsToNodePaths: {
			'root-style': makeNodePath('root-style'),
			child: makeNodePath('child'),
			'own-from': makeNodePath('own-from'),
			grandchild: makeNodePath('grandchild'),
		},
	});

	const getOffset = (id: string): number => {
		const track = timeline.find((t) => t.sequence.id === id);
		if (!track) {
			throw new Error(`Could not find track ${id}`);
		}

		return track.keyframeDisplayOffset;
	};

	expect(getOffset('root-style')).toBe(0);
	expect(getOffset('child')).toBe(30);
	expect(getOffset('own-from')).toBe(10);
	expect(getOffset('grandchild')).toBe(30);
	expect(
		timeline.find((t) => t.sequence.id === 'parent')?.keyframeDisplayOffset,
	).toBe(0);

	expect(
		getTimelineKeyframes(
			{
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 2},
					{frame: 60, value: 4},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
			getOffset('child'),
		),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 90, value: 4},
	]);
});

test('track lookup survives effect key changes', () => {
	const sequences = [
		makeSequence({
			id: 'sequence',
			from: 0,
			trimBefore: null,
			overrideId: 'sequence',
			nonce: 0,
		}),
	];
	const currentNodePath = makeNodePathWithEffectKeys('sequence', [
		['blur'],
		['noise'],
	]);
	const staleNodePath = makeNodePathWithEffectKeys('sequence', [['blur']]);

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths: {
			sequence: currentNodePath,
		},
		nodePathInfo: {
			sequenceSubscriptionKey: staleNodePath,
			auxiliaryKeys: [],
			index: 0,
			numberOfSequencesWithThisNodePath: 1,
			supportsEffects: true,
		},
	});

	expect(track?.nodePathInfo?.sequenceSubscriptionKey).toBe(currentNodePath);
});

test('keyframe display offsets account for parent trimBefore', () => {
	const timeline = calculateTimeline({
		sequences: [
			makeSequence({
				id: 'parent',
				from: 0,
				trimBefore: 20,
				nonce: 0,
			}),
			makeSequence({
				id: 'child',
				from: 0,
				trimBefore: null,
				parent: 'parent',
				overrideId: 'child',
				nonce: 1,
			}),
		],
		overrideIdsToNodePaths: {
			child: makeNodePath('child'),
		},
	});

	const child = timeline.find((t) => t.sequence.id === 'child');
	expect(child?.keyframeDisplayOffset).toBe(-20);
	expect(
		getTimelineKeyframes(
			{
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 20, value: 2},
					{frame: 120, value: 4},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
			child?.keyframeDisplayOffset ?? 0,
		),
	).toEqual([
		{frame: 0, value: 2},
		{frame: 100, value: 4},
	]);
});

test('timeline easing segments connect adjacent display keyframes', () => {
	const status: CanUpdateSequencePropStatusKeyframed = {
		...makeKeyframedStatus(),
		keyframes: [
			{frame: 0, value: 2},
			{frame: 30, value: 3},
			{frame: 60, value: 4},
		],
		easing: [{type: 'linear'}, {type: 'linear'}],
	};

	expect(getTimelineEasingSegments(getTimelineKeyframes(status, 30))).toEqual([
		{fromFrame: 30, toFrame: 60, segmentIndex: 0},
		{fromFrame: 60, toFrame: 90, segmentIndex: 1},
	]);
});

test('bounded keyframe drag delta stays inside the composition timeline', () => {
	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 10}],
			delta: -20,
			durationInFrames: 100,
		}),
	).toBe(-10);

	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 90}],
			delta: 20,
			durationInFrames: 100,
		}),
	).toBe(9);
});

test('bounded keyframe drag delta allows negative source frames when display frames stay in range', () => {
	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 30}],
			delta: -30,
			durationInFrames: 100,
		}),
	).toBe(-30);
});

test('bounded keyframe drag delta clamps multi-selection at the first timeline edge', () => {
	const targets = [{displayFrame: 20}, {displayFrame: 95}];

	expect(
		getBoundedKeyframeDragDelta({
			targets,
			delta: -30,
			durationInFrames: 100,
		}),
	).toBe(-20);

	expect(
		getBoundedKeyframeDragDelta({
			targets,
			delta: 10,
			durationInFrames: 100,
		}),
	).toBe(4);
});

test('getNodeKeyframes shows a temporary sequence keyframe from drag overrides', () => {
	const nodePath = makeNodePath('sequence');

	expect(
		getNodeKeyframes({
			node: makeSequenceFieldNode('style.scale'),
			nodePath,
			propStatuses: makePropStatuses(nodePath),
			keyframeDisplayOffset: 30,
			getDragOverrides: () => ({
				'style.scale': Internals.makeStaticDragOverride(3),
			}),
			getEffectDragOverrides: () => ({}),
			timelinePosition: 60,
		}),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 60, value: 3},
		{frame: 90, value: 4},
	]);
});

test('getNodeKeyframes shows a temporary effect keyframe from drag overrides', () => {
	const nodePath = makeNodePath('sequence');

	expect(
		getNodeKeyframes({
			node: makeEffectFieldNode('amount', 0),
			nodePath,
			propStatuses: makePropStatuses(nodePath),
			keyframeDisplayOffset: 30,
			getDragOverrides: () => ({}),
			getEffectDragOverrides: () => ({
				amount: Internals.makeStaticDragOverride(5),
			}),
			timelinePosition: 90,
		}),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 90, value: 5},
	]);
});

test('getNodeKeyframes shows sequence keyframes from keyframed drag overrides', () => {
	const nodePath = makeNodePath('sequence');

	expect(
		getNodeKeyframes({
			node: makeSequenceFieldNode('style.scale'),
			nodePath,
			propStatuses: makePropStatuses(nodePath),
			keyframeDisplayOffset: 30,
			getDragOverrides: () => ({
				'style.scale': Internals.makeKeyframedDragOverride({
					status: makeKeyframedStatus(),
					frame: 30,
					value: 3,
				}),
			}),
			getEffectDragOverrides: () => ({}),
			timelinePosition: 60,
		}),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 60, value: 3},
		{frame: 90, value: 4},
	]);
});

test('getNodeKeyframes replaces existing keyframes from keyframed drag overrides', () => {
	const nodePath = makeNodePath('sequence');

	expect(
		getNodeKeyframes({
			node: makeEffectFieldNode('amount', 0),
			nodePath,
			propStatuses: makePropStatuses(nodePath),
			keyframeDisplayOffset: 30,
			getDragOverrides: () => ({}),
			getEffectDragOverrides: () => ({
				amount: Internals.makeKeyframedDragOverride({
					status: makeKeyframedStatus(),
					frame: 60,
					value: 5,
				}),
			}),
			timelinePosition: 90,
		}),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 90, value: 5},
	]);
});

test('timeline keyframe drag keys follow the current display frame', () => {
	const {nodePathInfo} = makeSequenceFieldNode('style.scale');

	expect(
		getTimelineKeyframeDragKey({
			nodePathInfo,
			frame: 30,
		}),
	).not.toBe(
		getTimelineKeyframeDragKey({
			nodePathInfo,
			frame: 60,
		}),
	);
});
