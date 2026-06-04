import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatusKeyframed,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals, type CodeValues} from 'remotion';
import {getNodeKeyframes} from '../components/Timeline/get-node-keyframes';
import {getTimelineKeyframes} from '../components/Timeline/get-timeline-keyframes';
import {getTimelineKeyframeDragKey} from '../components/Timeline/TimelineKeyframeDragState';
import {calculateTimeline} from '../helpers/calculate-timeline';
import type {TimelineTreeNode} from '../helpers/timeline-layout';

const getStack = () => null;

const makeNodePath = (id: string): SequencePropsSubscriptionKey => ({
	absolutePath: '/src/Composition.tsx',
	nodePath: [id],
	sequenceKeys: ['style.scale'],
	effectKeys: [],
});

const makeControls = (
	overrideId: string,
): NonNullable<TSequence['controls']> => ({
	schema: {},
	currentRuntimeValueDotNotation: {},
	overrideId,
	supportsEffects: false,
});

const makeSequence = ({
	id,
	from,
	parent = null,
	overrideId = null,
	nonce,
}: {
	id: string;
	from: number;
	parent?: string | null;
	overrideId?: string | null;
	nonce: number;
}): TSequence => ({
	type: 'sequence',
	from,
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
});

const numberFieldSchema = {
	type: 'number',
	default: 1,
	hiddenFromList: false,
} as const;

const makeKeyframedStatus = (): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	codeValue: undefined,
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 2},
		{frame: 60, value: 4},
	],
	easing: ['linear'],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
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
	},
});

const makeCodeValues = (
	nodePath: SequencePropsSubscriptionKey,
): CodeValues => ({
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
				overrideId: 'root-style',
				nonce: 0,
			}),
			makeSequence({id: 'parent', from: 30, nonce: 1}),
			makeSequence({
				id: 'child',
				from: 0,
				parent: 'parent',
				overrideId: 'child',
				nonce: 2,
			}),
			makeSequence({id: 'outer', from: 10, nonce: 3}),
			makeSequence({
				id: 'own-from',
				from: 20,
				parent: 'outer',
				overrideId: 'own-from',
				nonce: 4,
			}),
			makeSequence({
				id: 'grandchild',
				from: 0,
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
				codeValue: undefined,
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 2},
					{frame: 60, value: 4},
				],
				easing: ['linear'],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
			getOffset('child'),
		),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 90, value: 4},
	]);
});

test('getNodeKeyframes shows a temporary sequence keyframe from drag overrides', () => {
	const nodePath = makeNodePath('sequence');

	expect(
		getNodeKeyframes({
			node: makeSequenceFieldNode('style.scale'),
			nodePath,
			codeValues: makeCodeValues(nodePath),
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
			codeValues: makeCodeValues(nodePath),
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
			codeValues: makeCodeValues(nodePath),
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
			codeValues: makeCodeValues(nodePath),
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
