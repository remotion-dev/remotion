import {expect, test} from 'bun:test';
import {
	Internals,
	type CodeValues,
	type SequenceNodePath,
	type SequencePropsSubscriptionKey,
	type SequenceSchema,
	type TSequence,
} from 'remotion';
import {
	getSelectedEffectFieldsBySequenceKey,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragValues,
	getUvCoordinateForPoint,
	getUvHandlePosition,
	type SelectedOutlineDragState,
} from '../components/SelectedOutlineOverlay';
import {deleteSelectedTimelineItems} from '../components/Timeline/delete-selected-timeline-item';
import {isDuplicatableSequenceRowSelection} from '../components/Timeline/duplicate-selected-timeline-item';
import {getTimelinePropResetTargets} from '../components/Timeline/reset-selected-timeline-props';
import {
	getPasteEffectsTarget,
	type PasteEffectsTarget,
} from '../components/Timeline/TimelineClipboardKeybindings';
import {
	ENABLE_OUTLINES,
	getSelectableTimelineSequenceSelections,
	getTimelineSelectionAfterInteraction,
	getTimelineSelectionFromNodePathInfo,
	getTimelineSequenceSelectionKey,
	isTimelineSelectionModifierEvent,
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
	supportsEffects = true,
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeKey(nodePath),
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects,
});

const makeTimelineSequence = ({
	schema,
	effects = [],
}: {
	readonly schema: SequenceSchema;
	readonly effects?: readonly {readonly schema: SequenceSchema}[];
}): TSequence =>
	({
		type: 'sequence',
		from: 0,
		duration: 100,
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
			schema,
			currentRuntimeValueDotNotation: {},
			overrideId: 'override',
			supportsEffects: true,
		},
		refForOutline: null,
		effects,
	}) as TSequence;

test('Timeline selection should stay disabled until released publicly', () => {
	expect(SELECTION_ENABLED).toBe(false);
});

test('pasting effects is blocked for sequences that do not support effects', () => {
	const unsupportedSequenceNodePathInfo = makeNodePathInfo(
		['body', 0],
		[],
		false,
	);
	const supportedSequenceNodePathInfo = makeNodePathInfo(['body', 1], [], true);

	expect(
		getPasteEffectsTarget([
			{type: 'sequence', nodePathInfo: unsupportedSequenceNodePathInfo},
		]),
	).toEqual({
		type: 'unsupported',
	} satisfies PasteEffectsTarget);
	expect(
		getPasteEffectsTarget([
			{type: 'sequence', nodePathInfo: supportedSequenceNodePathInfo},
		]),
	).toEqual({
		type: 'valid',
		nodePathInfo: supportedSequenceNodePathInfo,
	} satisfies PasteEffectsTarget);
});

test('Timeline top drag should not be enabled', () => {
	expect(TIMELINE_TOP_DRAG).toBe(false);
});

test('Timeline outlines should not be enabled', () => {
	expect(ENABLE_OUTLINES).toBe(false);
});

test('UV handles project semantic outline corners', () => {
	const points = [
		{x: 200, y: 200},
		{x: 100, y: 200},
		{x: 100, y: 100},
		{x: 200, y: 100},
	] as const;

	expect(getUvHandlePosition(points, [0, 0])).toEqual({x: 200, y: 200});
	expect(getUvHandlePosition(points, [1, 1])).toEqual({x: 100, y: 100});
	expect(getUvHandlePosition(points, [0.5, 0.5])).toEqual({x: 150, y: 150});
});

test('UV handles use projective projection for perspective quads', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 150, y: 100},
		{x: -50, y: 100},
	] as const;

	const projectedCenter = getUvHandlePosition(points, [0.5, 0.5]);

	expect(projectedCenter.x).toBeCloseTo(50, 5);
	expect(projectedCenter.y).toBeCloseTo(100 / 3, 5);
});

test('UV handle pointer position maps back to UV coordinates', () => {
	const points = [
		{x: 20, y: 10},
		{x: 140, y: 30},
		{x: 170, y: 120},
		{x: 40, y: 100},
	] as const;
	const uv = [0.25, 0.75] as const;
	const position = getUvHandlePosition(points, uv);
	const result = getUvCoordinateForPoint(points, position);

	expect(result[0]).toBeCloseTo(uv[0], 5);
	expect(result[1]).toBeCloseTo(uv[1], 5);
});

test('UV handles are requested for selected effect children', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 0], ['effects', '1']);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1', 'rays'],
	);
	const selectedEffects = getSelectedEffectFieldsBySequenceKey([
		{
			type: 'sequence-effect-prop',
			nodePathInfo: effectPropNodePathInfo,
			i: 1,
			key: 'rays',
		},
	]);

	expect(
		selectedEffects
			.get(getTimelineSequenceSelectionKey(sequenceNodePathInfo))
			?.get(1),
	).toEqual({
		allFields: true,
		fieldKeys: new Set(),
	});

	const selectedWholeEffects = getSelectedEffectFieldsBySequenceKey([
		{type: 'sequence-effect', nodePathInfo: effectNodePathInfo, i: 1},
	]);

	expect(
		selectedWholeEffects
			.get(getTimelineSequenceSelectionKey(sequenceNodePathInfo))
			?.get(1),
	).toEqual({
		allFields: true,
		fieldKeys: new Set(),
	});
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
			type: 'sequence',
			nodePathInfo: sequenceNodePathInfo,
		},
	]);
});

test('Cmd+D only duplicates selected timeline sequence rows', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 1], ['effects', '0']);

	expect(
		[
			{type: 'sequence' as const, nodePathInfo: sequenceNodePathInfo},
			{
				type: 'sequence-effect' as const,
				nodePathInfo: effectNodePathInfo,
				i: 0,
			},
			{
				type: 'keyframe' as const,
				nodePathInfo: sequenceNodePathInfo,
				frame: 12,
			},
		].filter(isDuplicatableSequenceRowSelection),
	).toEqual([
		{
			type: 'sequence',
			nodePathInfo: sequenceNodePathInfo,
		},
	]);
});

test('Backspace reset targets multiple selected sequence props', () => {
	const schema = {
		opacity: {type: 'number', default: 1},
		'style.rotate': {type: 'rotation', default: '0deg'},
	} satisfies SequenceSchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const rotateNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'style.rotate'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const codeValues = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {canUpdate: true, codeValue: 0.5},
				'style.rotate': {canUpdate: true, codeValue: '45deg'},
			},
			effects: [],
		},
	} satisfies CodeValues;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: opacityNodePathInfo,
				key: 'opacity',
			},
			{
				type: 'sequence-prop',
				nodePathInfo: rotateNodePathInfo,
				key: 'style.rotate',
			},
		],
		sequences: [makeTimelineSequence({schema})],
		overrideIdsToNodePaths: {override: nodePath},
		codeValues,
	});

	expect(resetTargets?.map((target) => target.fieldKey)).toEqual([
		'opacity',
		'style.rotate',
	]);
	expect(resetTargets?.map((target) => target.value)).toEqual([1, '0deg']);
});

test('Selected outline dragging applies the same delta to all selected sequences', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies SequenceSchema;
	const firstNodePath = makeKey(['body', 0]);
	const secondNodePath = makeKey(['body', 1]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(firstNodePath),
			startX: 10,
			startY: 20,
			target: {
				clientId: 'client',
				codeValue: {canUpdate: true, codeValue: '10px 20px'},
				fieldDefault: '0px 0px',
				nodePath: firstNodePath,
				schema,
			},
		},
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(secondNodePath),
			startX: -5,
			startY: 3,
			target: {
				clientId: 'client',
				codeValue: {canUpdate: true, codeValue: '-5px 3px'},
				fieldDefault: '0px 0px',
				nodePath: secondNodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineDragState[];

	const lastValues = getSelectedOutlineDragValues({
		dragStates,
		deltaX: 7,
		deltaY: -4,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('17px 16px');
	expect(lastValues.get(dragStates[1].key)).toBe('2px -1px');
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			fileName: '/project/src/Comp.tsx',
			nodePath: firstNodePath,
			fieldKey: 'style.translate',
			value: '17px 16px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
		{
			fileName: '/project/src/Comp.tsx',
			nodePath: secondNodePath,
			fieldKey: 'style.translate',
			value: '2px -1px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);
});

test('Backspace reset targets selected effect props', () => {
	const schema = {} satisfies SequenceSchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0},
	} satisfies SequenceSchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const codeValues = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'effect',
					importPath: null,
					effectIndex: 0,
					props: {
						intensity: {canUpdate: true, codeValue: 10},
					},
				},
			],
		},
	} satisfies CodeValues;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-effect-prop',
				nodePathInfo,
				i: 0,
				key: 'intensity',
			},
		],
		sequences: [
			makeTimelineSequence({
				schema,
				effects: [{schema: effectSchema}],
			}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		codeValues,
	});

	expect(resetTargets).toEqual([
		{
			type: 'effect-prop',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			effectIndex: 0,
			fieldKey: 'intensity',
			value: 0,
			defaultValue: '0',
			schema: effectSchema,
		},
	]);
});

test('Deleting mixed timeline selection types throws an assertion error', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 1], ['effects', '0']);

	expect(() =>
		deleteSelectedTimelineItems({
			selections: [
				{type: 'sequence', nodePathInfo: sequenceNodePathInfo},
				{
					type: 'sequence-effect',
					nodePathInfo: effectNodePathInfo,
					i: 0,
				},
			],
			sequences: [],
			overrideIdsToNodePaths: {},
			setCodeValues: () => undefined,
			clientId: 'client',
		}),
	).toThrow(/Assertion failed/);
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

test('Timeline row selections use explicit item variants', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const sequencePropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const allEffectsNodePathInfo = makeNodePathInfo(['body', 0], ['effects']);
	const effectNodePathInfo = makeNodePathInfo(['body', 0], ['effects', '1']);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1', 'blur'],
	);

	expect(getTimelineSelectionFromNodePathInfo(sequenceNodePathInfo)).toEqual({
		type: 'sequence',
		nodePathInfo: sequenceNodePathInfo,
	});
	expect(
		getTimelineSelectionFromNodePathInfo(sequencePropNodePathInfo),
	).toEqual({
		type: 'sequence-prop',
		nodePathInfo: sequencePropNodePathInfo,
		key: 'opacity',
	});
	expect(getTimelineSelectionFromNodePathInfo(allEffectsNodePathInfo)).toEqual({
		type: 'sequence-all-effects',
		nodePathInfo: allEffectsNodePathInfo,
	});
	expect(getTimelineSelectionFromNodePathInfo(effectNodePathInfo)).toEqual({
		type: 'sequence-effect',
		nodePathInfo: effectNodePathInfo,
		i: 1,
	});
	expect(getTimelineSelectionFromNodePathInfo(effectPropNodePathInfo)).toEqual({
		type: 'sequence-effect-prop',
		nodePathInfo: effectPropNodePathInfo,
		i: 1,
		key: 'blur',
	});
	expect(
		getTimelineSelectionFromNodePathInfo(
			makeNodePathInfo(['body', 0], ['effects', 'not-a-number']),
		),
	).toBe(null);
});

test('Cmd/Ctrl+click toggles row selections', () => {
	const rowA = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
	};
	const rowB = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 1], []),
	};
	const allSelectableItems = [rowA, rowB];

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [rowA],
				anchor: rowA,
			},
			clickedItem: rowB,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [rowA, rowB],
		anchor: rowB,
	});

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [rowA, rowB],
				anchor: rowB,
			},
			clickedItem: rowA,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [rowB],
		anchor: rowA,
	});
});

test('Shift+click selects a contiguous row range from the anchor', () => {
	const rowA = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
	};
	const rowB = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 1], []),
	};
	const rowC = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 2], []),
	};
	const allSelectableItems = [rowA, rowB, rowC];

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [rowA],
				anchor: rowA,
			},
			clickedItem: rowC,
			interaction: {shiftKey: true, toggleKey: false},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [rowA, rowB, rowC],
		anchor: rowA,
	});
});

test('Shift+click with no matching anchor falls back to single selection', () => {
	const rowA = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
	};
	const keyframe = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
		frame: 10,
	};

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [keyframe],
				anchor: keyframe,
			},
			clickedItem: rowA,
			interaction: {shiftKey: true, toggleKey: false},
			allSelectableItems: [rowA],
		}),
	).toEqual({
		selectedItems: [rowA],
		anchor: rowA,
	});
});

test('Timeline double-click actions ignore selection modifier clicks', () => {
	expect(
		isTimelineSelectionModifierEvent({
			shiftKey: true,
			metaKey: false,
			ctrlKey: false,
		}),
	).toBe(true);
	expect(
		isTimelineSelectionModifierEvent({
			shiftKey: false,
			metaKey: true,
			ctrlKey: false,
		}),
	).toBe(true);
	expect(
		isTimelineSelectionModifierEvent({
			shiftKey: false,
			metaKey: false,
			ctrlKey: true,
		}),
	).toBe(true);
	expect(
		isTimelineSelectionModifierEvent({
			shiftKey: false,
			metaKey: false,
			ctrlKey: false,
		}),
	).toBe(false);
});
