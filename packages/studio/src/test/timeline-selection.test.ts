import {expect, test} from 'bun:test';
import type {RefObject} from 'react';
import {
	Internals,
	type InteractivitySchema,
	type PropStatuses,
	type SequenceNodePath,
	type SequencePropsSubscriptionKey,
	type TSequence,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {getInspectorSelectableItems} from '../components/InspectorSequenceSection';
import type {SelectedOutline} from '../components/selected-outline-geometry';
import {getSelectedTransformOriginInfo} from '../components/selected-outline-measurement';
import type {SelectedOutlineTarget} from '../components/selected-outline-types';
import {
	constrainUv,
	getSelectedUvHandles,
	getUvCoordinateForPoint,
	getUvEllipseInteractiveControls,
	getUvHandleConnectionEllipses,
	getUvHandleConnectionLines,
	getUvHandlePosition,
	roundUvCoordinate,
	type SelectedOutlineUvHandle,
} from '../components/selected-outline-uv';
import {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
	getOutlineDoubleClickAction,
	getOutlineSelectionInteraction,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedOutlineActiveSchema,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDelta,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineRotationPivot,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	getSelectedOutlineTransformOriginLockedAxis,
	getSelectedSequenceKeys,
	getSequencesWithSelectableOutlines,
	getTransformedSvgViewportPoints,
	isSelectedOutlineDragPastThreshold,
	orderOutlinesForRendering,
	selectedOutlineDragThresholdPx,
	selectedOutlineTransformOriginSnapThresholdPx,
	selectedOutlineUvSnapThresholdPx,
	snapSelectedOutlineRotationDeltaDegrees,
	snapSelectedOutlineTransformOriginUv,
	snapSelectedOutlineUv,
	type SelectedOutlineDragState,
	type SelectedOutlineRotationDragState,
	type SelectedOutlineScaleDragState,
} from '../components/SelectedOutlineOverlay';
import {getSelectedOutlineUvHandleTimelineSelection} from '../components/SelectedOutlineUvControls';
import {
	deleteSelectedTimelineItems,
	getTimelineSelectionAfterDeletingItems,
} from '../components/Timeline/delete-selected-timeline-item';
import {
	isDuplicatableEffectSelection,
	isDuplicatableSequenceRowSelection,
} from '../components/Timeline/duplicate-selected-timeline-item';
import {
	getKeyframeClipboardDataFromSelections,
	getPasteKeyframeTarget,
	type PasteKeyframeTarget,
} from '../components/Timeline/keyframe-clipboard';
import {getTimelinePropResetTargets} from '../components/Timeline/reset-selected-timeline-props';
import {shouldSubscribeToSequenceProps} from '../components/Timeline/should-subscribe-to-sequence-props';
import {
	getEasingClipboardDataFromSelection,
	getEffectsClipboardEnvelopeFromSelections,
	getEffectPropClipboardDataFromSelection,
	getPasteEffectPropTarget,
	getPasteEffectsTarget,
	getSnapshotsFromSelection,
	type PasteEffectPropTarget,
	type PasteEffectsTarget,
} from '../components/Timeline/TimelineClipboardKeybindings';
import {getSelectedKeyframeControlNodePathInfos} from '../components/Timeline/TimelineKeyframeControls';
import {
	getAvailableTimelineSelectionState,
	getClampedTimelineMarqueePoint,
	getSelectableTimelineItems,
	getSelectableTimelineSequenceSelections,
	getTimelineMarqueeSelection,
	getTimelineSelectionAfterInteraction,
	getTimelineSelectionFromNodePathInfo,
	getTimelineSelectionKey,
	getTimelineSequenceSelectionKey,
	isTimelineSelectionModifierEvent,
	shouldSelectTimelineRowOnPointerDown,
	TIMELINE_BACKGROUND,
	TIMELINE_TICKS_BACKGROUND,
	timelineMarqueeRectsIntersect,
} from '../components/Timeline/TimelineSelection';
import {
	getTimelineSequenceDurationDragChanges,
	getTimelineSequenceDurationDragTargets,
	getTimelineSequenceDurationDragValue,
	getTimelineSequenceFromDragChanges,
	getTimelineSequenceFromDragKeyframeMoves,
	getTimelineSequenceFromDragTargets,
	getTimelineSequenceFromDragValue,
	getTimelineSequenceLeftEdgeDragChanges,
	getTimelineSequenceLeftEdgeDragTargets,
	getTimelineSequenceLeftEdgeDragValues,
	isTimelineSequenceDurationDraggable,
} from '../components/Timeline/TimelineSequenceRightEdgeDragHandle';
import {
	parsedTransformOriginToUv,
	parseTransformOrigin,
	serializeTransformOrigin,
} from '../components/Timeline/transform-origin-utils';
import {
	getKeyframesForTimelineEasingDrag,
	getTimelineSelectionsAfterEasingKeyframeDrag,
} from '../components/Timeline/use-timeline-keyframe-drag';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	loadEditorShowOutlinesOption,
	persistEditorShowOutlinesOption,
} from '../state/editor-outlines';

const makeKey = (
	nodePath: SequenceNodePath,
	effectKeys: string[][] = [],
): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath,
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys,
	videoConfigValues: null,
});

const withMockLocalStorage = (callback: () => void) => {
	const previousDescriptor = Object.getOwnPropertyDescriptor(
		globalThis,
		'localStorage',
	);
	const values = new Map<string, string>();
	const localStorageMock: Storage = {
		clear: () => values.clear(),
		getItem: (key: string) => values.get(key) ?? null,
		key: (index: number) => [...values.keys()][index] ?? null,
		removeItem: (key: string) => values.delete(key),
		setItem: (key: string, value: string) => values.set(key, value),
		get length() {
			return values.size;
		},
	};

	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: localStorageMock,
	});

	try {
		callback();
	} finally {
		if (previousDescriptor) {
			Object.defineProperty(globalThis, 'localStorage', previousDescriptor);
		} else {
			Reflect.deleteProperty(globalThis, 'localStorage');
		}
	}
};

const makeNodePathInfo = (
	nodePath: SequenceNodePath,
	auxiliaryKeys: string[],
	supportsEffects = true,
	effectKeys: string[][] = [],
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeKey(nodePath, effectKeys),
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects,
});

const makeTimelineSequence = ({
	schema,
	effects = [],
	id = 'sequence',
	overrideId = 'override',
	parentId = null,
	refForOutline = null,
	duration = 100,
	from = 0,
	startMediaFrom = 0,
	type = 'sequence',
	showInTimeline = true,
}: {
	readonly schema: InteractivitySchema;
	readonly effects?: readonly {readonly schema: InteractivitySchema}[];
	readonly id?: string;
	readonly overrideId?: string;
	readonly parentId?: string | null;
	readonly refForOutline?: RefObject<HTMLElement | null> | null;
	readonly duration?: number;
	readonly from?: number;
	readonly startMediaFrom?: number;
	readonly type?: TSequence['type'];
	readonly showInTimeline?: boolean;
}): TSequence =>
	({
		type,
		from,
		trimBefore: null,
		duration,
		id,
		displayName: id,
		documentationLink: null,
		parent: parentId,
		rootId: 'root',
		showInTimeline,
		nonce: [[0, 0]],
		loopDisplay: undefined,
		getStack: () => null,
		premountDisplay: null,
		postmountDisplay: null,
		controls: {
			schema,
			currentRuntimeValueDotNotation: {},
			overrideId,
			supportsEffects: true,
			componentIdentity: null,
			componentName: '<Sequence>',
		},
		refForOutline,
		isInsideSeries: false,
		effects,
		frozenFrame: null,
		startMediaFrom,
	}) as TSequence;

const makeDurationPropStatuses = (
	nodePaths: readonly SequencePropsSubscriptionKey[],
): PropStatuses => {
	const propStatuses: PropStatuses = {};
	for (const nodePath of nodePaths) {
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] = {
			canUpdate: true,
			props: {
				durationInFrames: {status: 'static', codeValue: 100},
			},
			effects: [],
		};
	}

	return propStatuses;
};

const makeFromPropStatuses = (
	nodePaths: readonly SequencePropsSubscriptionKey[],
): PropStatuses => {
	const propStatuses: PropStatuses = {};
	for (const nodePath of nodePaths) {
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] = {
			canUpdate: true,
			props: {
				from: {status: 'static', codeValue: 0},
			},
			effects: [],
		};
	}

	return propStatuses;
};

const makeLeftEdgePropStatuses = (
	nodePaths: readonly SequencePropsSubscriptionKey[],
	includeTrimBefore = false,
	includeTimelineRange = true,
): PropStatuses => {
	const propStatuses: PropStatuses = {};
	for (const nodePath of nodePaths) {
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] = {
			canUpdate: true,
			props: {
				...(includeTimelineRange
					? {
							durationInFrames: {status: 'static' as const, codeValue: 100},
							from: {status: 'static' as const, codeValue: 0},
						}
					: {}),
				...(includeTrimBefore
					? {trimBefore: {status: 'static' as const, codeValue: 0}}
					: {}),
			},
			effects: [],
		};
	}

	return propStatuses;
};

test('timeline marquee rectangle intersection detects overlapping targets', () => {
	expect(
		timelineMarqueeRectsIntersect(
			{left: 0, top: 0, right: 10, bottom: 10},
			{left: 5, top: 5, right: 15, bottom: 15},
		),
	).toBe(true);
	expect(
		timelineMarqueeRectsIntersect(
			{left: 0, top: 0, right: 10, bottom: 10},
			{left: 11, top: 0, right: 20, bottom: 10},
		),
	).toBe(false);
});

test('Timeline skips prop subscriptions for hidden timeline sequences', () => {
	const schema = {} satisfies InteractivitySchema;
	const visibleSequence = {
		...makeTimelineSequence({schema}),
		getStack: () => 'stack',
	};
	const hiddenSequence = {
		...visibleSequence,
		showInTimeline: false,
	};

	expect(shouldSubscribeToSequenceProps(visibleSequence, true)).toBe(true);
	expect(shouldSubscribeToSequenceProps(hiddenSequence, true)).toBe(false);
});

test('timeline marquee points are clamped to the track bounds', () => {
	expect(
		getClampedTimelineMarqueePoint({
			bounds: {left: 10, top: 20, right: 100, bottom: 200},
			x: 5,
			y: 250,
		}),
	).toEqual({x: 10, y: 200});
	expect(
		getClampedTimelineMarqueePoint({
			bounds: {left: 10, top: 20, right: 100, bottom: 200},
			x: 80,
			y: 60,
		}),
	).toEqual({x: 80, y: 60});
});

test('timeline marquee locks to sequences after capturing a sequence first', () => {
	const firstSequence = makeNodePathInfo(['body', 0], []);
	const keyframe = makeNodePathInfo(['body', 1], ['controls', 'opacity']);
	const secondSequence = makeNodePathInfo(['body', 2], []);

	const result = getTimelineMarqueeSelection({
		lockedSelectionKind: null,
		marqueeRect: {left: 0, top: 0, right: 100, bottom: 100},
		candidates: [
			{
				item: {type: 'sequence', nodePathInfo: firstSequence},
				rect: {left: 0, top: 0, right: 10, bottom: 10},
			},
			{
				item: {type: 'keyframe', nodePathInfo: keyframe, frame: 20},
				rect: {left: 20, top: 0, right: 30, bottom: 10},
			},
			{
				item: {type: 'sequence', nodePathInfo: secondSequence},
				rect: {left: 40, top: 0, right: 50, bottom: 10},
			},
		],
	});

	expect(result.lockedSelectionKind).toBe('sequence');
	expect(result.selectedItems).toEqual([
		{type: 'sequence', nodePathInfo: firstSequence},
		{type: 'sequence', nodePathInfo: secondSequence},
	]);
});

test('timeline marquee locks to keyframes and easings after capturing a keyframe first', () => {
	const keyframe = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const sequence = makeNodePathInfo(['body', 1], []);

	const result = getTimelineMarqueeSelection({
		lockedSelectionKind: null,
		marqueeRect: {left: 0, top: 0, right: 100, bottom: 100},
		candidates: [
			{
				item: {type: 'keyframe', nodePathInfo: keyframe, frame: 20},
				rect: {left: 0, top: 0, right: 10, bottom: 10},
			},
			{
				item: {type: 'sequence', nodePathInfo: sequence},
				rect: {left: 20, top: 0, right: 30, bottom: 10},
			},
			{
				item: {
					type: 'easing',
					nodePathInfo: keyframe,
					fromFrame: 20,
					toFrame: 30,
					segmentIndex: 0,
				},
				rect: {left: 40, top: 0, right: 50, bottom: 10},
			},
			{
				item: {type: 'keyframe', nodePathInfo: keyframe, frame: 30},
				rect: {left: 60, top: 0, right: 70, bottom: 10},
			},
		],
	});

	expect(result.lockedSelectionKind).toBe('keyframes-and-easings');
	expect(result.selectedItems).toEqual([
		{type: 'keyframe', nodePathInfo: keyframe, frame: 20},
		{
			type: 'easing',
			nodePathInfo: keyframe,
			fromFrame: 20,
			toFrame: 30,
			segmentIndex: 0,
		},
		{type: 'keyframe', nodePathInfo: keyframe, frame: 30},
	]);
});

test('timeline marquee selects easing only when both endpoint keyframes intersect', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const easing = {
		type: 'easing' as const,
		nodePathInfo,
		fromFrame: 20,
		toFrame: 30,
		segmentIndex: 0,
	};
	const candidates = [
		{
			item: {type: 'keyframe' as const, nodePathInfo, frame: 20},
			rect: {left: 0, top: 0, right: 10, bottom: 10},
		},
		{
			item: easing,
			rect: {left: 20, top: 0, right: 80, bottom: 10},
		},
		{
			item: {type: 'keyframe' as const, nodePathInfo, frame: 30},
			rect: {left: 90, top: 0, right: 100, bottom: 10},
		},
	];

	expect(
		getTimelineMarqueeSelection({
			lockedSelectionKind: null,
			marqueeRect: {left: 20, top: 0, right: 80, bottom: 10},
			candidates,
		}),
	).toEqual({lockedSelectionKind: null, selectedItems: []});
	expect(
		getTimelineMarqueeSelection({
			lockedSelectionKind: null,
			marqueeRect: {left: 0, top: 0, right: 100, bottom: 10},
			candidates,
		}),
	).toEqual({
		lockedSelectionKind: 'keyframes-and-easings',
		selectedItems: [candidates[0].item, easing, candidates[2].item],
	});
});

test('timeline marquee keeps its locked item kind while dragging', () => {
	const keyframe = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const sequence = makeNodePathInfo(['body', 1], []);

	const result = getTimelineMarqueeSelection({
		lockedSelectionKind: 'keyframes-and-easings',
		marqueeRect: {left: 0, top: 0, right: 100, bottom: 100},
		candidates: [
			{
				item: {type: 'sequence', nodePathInfo: sequence},
				rect: {left: 0, top: 0, right: 10, bottom: 10},
			},
			{
				item: {type: 'keyframe', nodePathInfo: keyframe, frame: 20},
				rect: {left: 20, top: 0, right: 30, bottom: 10},
			},
		],
	});

	expect(result.lockedSelectionKind).toBe('keyframes-and-easings');
	expect(result.selectedItems).toEqual([
		{type: 'keyframe', nodePathInfo: keyframe, frame: 20},
	]);
});

test('timeline marquee can choose a new item kind after the locked kind selects nothing', () => {
	const keyframe = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const sequence = makeNodePathInfo(['body', 1], []);

	const result = getTimelineMarqueeSelection({
		lockedSelectionKind: 'sequence',
		marqueeRect: {left: 0, top: 0, right: 100, bottom: 100},
		candidates: [
			{
				item: {type: 'keyframe', nodePathInfo: keyframe, frame: 20},
				rect: {left: 20, top: 0, right: 30, bottom: 10},
			},
			{
				item: {type: 'sequence', nodePathInfo: sequence},
				rect: {left: 120, top: 0, right: 130, bottom: 10},
			},
		],
	});

	expect(result.lockedSelectionKind).toBe('keyframes-and-easings');
	expect(result.selectedItems).toEqual([
		{type: 'keyframe', nodePathInfo: keyframe, frame: 20},
	]);
});

test('timeline marquee clears its item kind when no target is selected', () => {
	const sequence = makeNodePathInfo(['body', 0], []);

	const result = getTimelineMarqueeSelection({
		lockedSelectionKind: 'sequence',
		marqueeRect: {left: 0, top: 0, right: 100, bottom: 100},
		candidates: [
			{
				item: {type: 'sequence', nodePathInfo: sequence},
				rect: {left: 120, top: 0, right: 130, bottom: 10},
			},
		],
	});

	expect(result.lockedSelectionKind).toBe(null);
	expect(result.selectedItems).toEqual([]);
});

test('keyframe diamond target resolution uses all selected prop rows when clicked row is selected', () => {
	const opacity = makeNodePathInfo(['body', 0], ['controls', 'style.opacity']);
	const rotate = makeNodePathInfo(['body', 0], ['controls', 'style.rotate']);

	expect(
		getSelectedKeyframeControlNodePathInfos({
			clickedNodePathInfo: opacity,
			selectedItems: [
				{type: 'sequence-prop', nodePathInfo: opacity, key: 'style.opacity'},
				{type: 'sequence-prop', nodePathInfo: rotate, key: 'style.rotate'},
			],
		}),
	).toEqual([opacity, rotate]);
});

test('keyframe diamond target resolution falls back to clicked row when it is not selected', () => {
	const opacity = makeNodePathInfo(['body', 0], ['controls', 'style.opacity']);
	const rotate = makeNodePathInfo(['body', 0], ['controls', 'style.rotate']);

	expect(
		getSelectedKeyframeControlNodePathInfos({
			clickedNodePathInfo: opacity,
			selectedItems: [
				{type: 'sequence-prop', nodePathInfo: rotate, key: 'style.rotate'},
			],
		}),
	).toEqual([opacity]);
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

test('pasting effects treats effect selections on one sequence as one target', () => {
	const firstEffectNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0'],
		true,
		[['0']],
	);
	const secondEffectNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1'],
		true,
		[['1']],
	);

	expect(
		getPasteEffectsTarget([
			{type: 'sequence-effect', nodePathInfo: firstEffectNodePathInfo, i: 0},
			{type: 'sequence-effect', nodePathInfo: secondEffectNodePathInfo, i: 1},
		]),
	).toEqual({
		type: 'valid',
		nodePathInfo: firstEffectNodePathInfo,
	} satisfies PasteEffectsTarget);
});

test('copying a keyframed effect creates a structured snapshot', () => {
	const effectNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0'],
		true,
		[['0']],
	);
	const nodePath = effectNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'effect',
					importPath: '@remotion/effect',
					effectIndex: 0,
					props: {
						intensity: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 10},
								{frame: 100, value: 20},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	} satisfies PropStatuses;

	expect(
		getSnapshotsFromSelection({
			selection: {
				type: 'sequence-effect',
				nodePathInfo: effectNodePathInfo,
				i: 0,
			},
			propStatuses,
		}),
	).toEqual([
		{
			callee: 'effect',
			importPath: '@remotion/effect',
			params: {
				intensity: {
					type: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 10},
						{frame: 100, value: 20},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'clamp', right: 'clamp'},
				},
			},
		},
	]);
});

test('cut effect clipboard metadata preserves source order', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['effects', '0'], true, [
		['0'],
	]);
	const blur = {
		callee: 'blur',
		importPath: '@remotion/effects/blur',
		params: {},
	};
	const brightness = {
		callee: 'brightness',
		importPath: '@remotion/effects/brightness',
		params: {},
	};
	const envelope = getEffectsClipboardEnvelopeFromSelections({
		selectedItems: [
			{type: 'sequence-effect', nodePathInfo, i: 1},
			{type: 'sequence-effect', nodePathInfo, i: 0},
		],
		payload: {
			type: 'effects-additive',
			version: 3,
			remotionClipboard: 'effects',
			effects: [blur, brightness],
		},
	});

	expect(envelope.sourceIdentity).not.toBe(null);
	expect(envelope.originalEffectIndices).toEqual([0, 1]);
	expect(envelope.payload.effects).toEqual([brightness, blur]);
});

test('copying a selected effect prop creates an effect prop payload', () => {
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
		true,
		[['0', 'intensity']],
	);
	const nodePath = effectPropNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'halftone',
					importPath: '@remotion/effects/halftone',
					effectIndex: 0,
					props: {
						intensity: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 10},
								{frame: 100, value: 20},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	} satisfies PropStatuses;

	expect(
		getEffectPropClipboardDataFromSelection({
			selection: {
				type: 'sequence-effect-prop',
				nodePathInfo: effectPropNodePathInfo,
				i: 0,
				key: 'intensity',
			},
			propStatuses,
		}),
	).toEqual({
		type: 'effect-prop',
		version: 1,
		remotionClipboard: 'effect-prop',
		effect: {
			callee: 'halftone',
			importPath: '@remotion/effects/halftone',
		},
		key: 'intensity',
		param: {
			type: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 10},
				{frame: 100, value: 20},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'clamp'},
		},
	});
});

test('copying selected keyframes preserves their frame deltas', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 10, value: 0.4},
						{frame: 30, value: 0.8},
					],
					easing: [],
					clamping: {left: 'clamp', right: 'clamp'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getKeyframeClipboardDataFromSelections({
			selections: [
				{type: 'keyframe', nodePathInfo, frame: 30},
				{type: 'keyframe', nodePathInfo, frame: 10},
				{
					type: 'easing',
					nodePathInfo,
					fromFrame: 10,
					toFrame: 30,
					segmentIndex: 0,
				},
			],
			sequences: [makeTimelineSequence({schema, from: 20})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({
		type: 'keyframe',
		version: 1,
		remotionClipboard: 'keyframe',
		fieldType: 'number',
		keyframes: [
			{frameOffset: 0, value: 0.4},
			{frameOffset: 20, value: 0.8},
		],
		easing: [{type: 'linear'}],
	});
});

test('copying selected keyframes requires one property', () => {
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const otherNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'otherOpacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
		otherOpacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [{frame: 10, value: 0.4}],
					easing: [],
					clamping: {left: 'clamp', right: 'clamp'},
					posterize: undefined,
					output: undefined,
				},
				otherOpacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [{frame: 30, value: 2}],
					easing: [],
					clamping: {left: 'clamp', right: 'clamp'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getKeyframeClipboardDataFromSelections({
			selections: [
				{type: 'keyframe', nodePathInfo: opacityNodePathInfo, frame: 10},
				{type: 'keyframe', nodePathInfo: otherNodePathInfo, frame: 30},
			],
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toBe(null);
});

test('pasting keyframes targets one selected property at the playhead', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {status: 'static', codeValue: 1},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getPasteKeyframeTarget({
			selectedItems: [
				{type: 'keyframe', nodePathInfo, frame: 10},
				{type: 'keyframe', nodePathInfo, frame: 30},
			],
			payload: {
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [
					{frameOffset: 0, value: 0.4},
					{frameOffset: 20, value: 0.8},
				],
				easing: [{type: 'linear'}],
			},
			timelinePosition: 50,
			sequences: [makeTimelineSequence({schema, from: 20})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({
		type: 'valid',
		fileName: '/project/src/Comp.tsx',
		nodePath,
		fieldKey: 'opacity',
		effectIndex: null,
		keyframes: [
			{sourceFrame: 50, value: 0.4},
			{sourceFrame: 70, value: 0.8},
		],
		keyframesToDelete: [],
		easing: [{type: 'linear'}],
		firstEasingSegmentIndex: 0,
		schema,
	} satisfies PasteKeyframeTarget);
});

test('pasting keyframes replaces the destination range and preserves easing', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 40, value: 0},
						{frame: 60, value: 0.5},
						{frame: 80, value: 1},
					],
					easing: [{type: 'linear'}, {type: 'linear'}],
					clamping: {left: 'clamp', right: 'clamp'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;
	const copiedEasing = {
		type: 'bezier',
		x1: 0.42,
		y1: 0,
		x2: 0.58,
		y2: 1,
	} as const;

	expect(
		getPasteKeyframeTarget({
			selectedItems: [{type: 'sequence-prop', nodePathInfo, key: 'opacity'}],
			payload: {
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [
					{frameOffset: 0, value: 0.25},
					{frameOffset: 20, value: 0.75},
				],
				easing: [copiedEasing],
			},
			timelinePosition: 50,
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({
		type: 'valid',
		fileName: '/project/src/Comp.tsx',
		nodePath,
		fieldKey: 'opacity',
		effectIndex: null,
		keyframes: [
			{sourceFrame: 50, value: 0.25},
			{sourceFrame: 70, value: 0.75},
		],
		keyframesToDelete: [60],
		easing: [copiedEasing],
		firstEasingSegmentIndex: 1,
		schema,
	} satisfies PasteKeyframeTarget);
});

test('pasting a keyframe rejects an incompatible property', () => {
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'background'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const schema = {
		background: {type: 'color', default: '#ffffff'},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				background: {status: 'static', codeValue: '#ffffff'},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getPasteKeyframeTarget({
			selectedItems: [
				{
					type: 'sequence-prop',
					nodePathInfo,
					key: 'background',
				},
			],
			payload: {
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [{frameOffset: 0, value: 0.4}],
				easing: [],
			},
			timelinePosition: 50,
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({type: 'incompatible'} satisfies PasteKeyframeTarget);
});

test('copying a selected sequence easing creates an easing payload', () => {
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const easing = {
		type: 'bezier',
		x1: 0.42,
		y1: 0,
		x2: 0.58,
		y2: 1,
	} as const;
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 100, value: 1},
					],
					easing: [easing],
					clamping: {left: 'clamp', right: 'clamp'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getEasingClipboardDataFromSelection({
			selection: {
				type: 'easing',
				nodePathInfo: opacityNodePathInfo,
				fromFrame: 0,
				toFrame: 100,
				segmentIndex: 0,
			},
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({
		type: 'easing',
		version: 1,
		remotionClipboard: 'easing',
		easing,
	});
});

test('copying a selected effect easing creates an easing payload', () => {
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
		true,
		[['0', 'intensity']],
	);
	const nodePath = effectPropNodePathInfo.sequenceSubscriptionKey;
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'halftone',
					importPath: '@remotion/effects/halftone',
					effectIndex: 0,
					props: {
						intensity: {
							status: 'keyframed',
							interpolationFunction: 'interpolateColors',
							keyframes: [
								{frame: 0, value: 10},
								{frame: 100, value: 20},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	} satisfies PropStatuses;

	expect(
		getEasingClipboardDataFromSelection({
			selection: {
				type: 'easing',
				nodePathInfo: effectPropNodePathInfo,
				fromFrame: 0,
				toFrame: 100,
				segmentIndex: 0,
			},
			sequences: [
				makeTimelineSequence({
					schema,
					effects: [{schema: effectSchema}],
				}),
			],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
		}),
	).toEqual({
		type: 'easing',
		version: 1,
		remotionClipboard: 'easing',
		easing: {type: 'linear'},
	});
});

test('pasting an effect prop targets a matching selected effect', () => {
	const effectNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1'],
		true,
		[['1']],
	);
	const nodePath = effectNodePathInfo.sequenceSubscriptionKey;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'halftone',
					importPath: '@remotion/effects/halftone',
					effectIndex: 1,
					props: {
						intensity: {status: 'static', codeValue: 0},
					},
				},
			],
		},
	} satisfies PropStatuses;

	expect(
		getPasteEffectPropTarget({
			selectedItems: [
				{type: 'sequence-effect', nodePathInfo: effectNodePathInfo, i: 1},
			],
			payload: {
				type: 'effect-prop',
				version: 1,
				remotionClipboard: 'effect-prop',
				effect: {
					callee: 'halftone',
					importPath: '@remotion/effects/halftone',
				},
				key: 'intensity',
				param: {type: 'static', value: 10},
			},
			propStatuses,
			sequences: [
				makeTimelineSequence({
					schema: {},
					effects: [{schema: effectSchema}, {schema: effectSchema}],
				}),
			],
			overrideIdsToNodePaths: {override: nodePath},
		}),
	).toEqual({
		type: 'valid',
		fileName: '/project/src/Comp.tsx',
		nodePath,
		effectIndex: 1,
		fieldKey: 'intensity',
		defaultValue: '0',
		schema: effectSchema,
	} satisfies PasteEffectPropTarget);
});

test('pasting an effect prop requires the same effect type and prop key', () => {
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'opacity'],
		true,
		[['0', 'opacity']],
	);
	const nodePath = effectPropNodePathInfo.sequenceSubscriptionKey;
	const effectSchema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'blur',
					importPath: '@remotion/effects/blur',
					effectIndex: 0,
					props: {
						opacity: {status: 'static', codeValue: 1},
						intensity: {status: 'static', codeValue: 0},
					},
				},
			],
		},
	} satisfies PropStatuses;
	const basePayload = {
		type: 'effect-prop' as const,
		version: 1 as const,
		remotionClipboard: 'effect-prop' as const,
		effect: {
			callee: 'halftone',
			importPath: '@remotion/effects/halftone',
		},
		key: 'intensity',
		param: {type: 'static' as const, value: 10},
	};

	expect(
		getPasteEffectPropTarget({
			selectedItems: [
				{
					type: 'sequence-effect-prop',
					nodePathInfo: effectPropNodePathInfo,
					i: 0,
					key: 'opacity',
				},
			],
			payload: basePayload,
			propStatuses,
			sequences: [
				makeTimelineSequence({
					schema: {},
					effects: [{schema: effectSchema}],
				}),
			],
			overrideIdsToNodePaths: {override: nodePath},
		}),
	).toEqual({type: 'prop-mismatch'} satisfies PasteEffectPropTarget);

	expect(
		getPasteEffectPropTarget({
			selectedItems: [
				{type: 'sequence-effect', nodePathInfo: effectPropNodePathInfo, i: 0},
			],
			payload: basePayload,
			propStatuses,
			sequences: [
				makeTimelineSequence({
					schema: {},
					effects: [{schema: effectSchema}],
				}),
			],
			overrideIdsToNodePaths: {override: nodePath},
		}),
	).toEqual({type: 'effect-type-mismatch'} satisfies PasteEffectPropTarget);
});

test('Timeline duration drag applies the same delta to selected sequences', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const sequences = [
		makeTimelineSequence({
			schema,
			id: 'first',
			overrideId: 'first',
			duration: 40,
			from: 0,
		}),
		makeTimelineSequence({
			schema,
			id: 'second',
			overrideId: 'second',
			duration: 15,
			from: 10,
		}),
	];
	const targets = getTimelineSequenceDurationDragTargets({
		draggedNodePathInfo: firstNodePathInfo,
		selectedItems: [
			{type: 'sequence', nodePathInfo: firstNodePathInfo},
			{type: 'sequence', nodePathInfo: secondNodePathInfo},
		],
		sequences,
		overrideIdsToNodePaths: {
			first: firstNodePathInfo.sequenceSubscriptionKey,
			second: secondNodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeDurationPropStatuses([
			firstNodePathInfo.sequenceSubscriptionKey,
			secondNodePathInfo.sequenceSubscriptionKey,
		]),
	});

	expect(targets?.map((target) => target.initialDuration)).toEqual([40, 15]);
	expect(
		getTimelineSequenceDurationDragChanges({
			targets: targets ?? [],
			deltaFrames: -10,
		}).map((change) => change.value),
	).toEqual([30, 5]);
	expect(
		getTimelineSequenceDurationDragChanges({
			targets: targets ?? [],
			deltaFrames: -10,
		}).map((change) => change.schema),
	).toEqual([schema, schema]);
});

test('Timeline duration drag uses the declared duration for negative from values', () => {
	const schema = {} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const targets = getTimelineSequenceDurationDragTargets({
		draggedNodePathInfo: nodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				duration: 36,
				from: -3,
			}),
		],
		overrideIdsToNodePaths: {
			override: nodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeDurationPropStatuses([
			nodePathInfo.sequenceSubscriptionKey,
		]),
	});

	expect(targets?.map((target) => target.initialDuration)).toEqual([36]);
	expect(
		getTimelineSequenceDurationDragChanges({
			targets: targets ?? [],
			deltaFrames: 0,
		}),
	).toEqual([]);
});

test('Timeline duration drag supports interactive video clips', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const video = makeTimelineSequence({
		schema: Internals.baseSchema,
		type: 'video',
		duration: 78,
	});

	expect(isTimelineSequenceDurationDraggable(video)).toBe(true);
	expect(
		getTimelineSequenceDurationDragTargets({
			draggedNodePathInfo: nodePathInfo,
			selectedItems: [{type: 'sequence', nodePathInfo}],
			sequences: [video],
			overrideIdsToNodePaths: {
				override: nodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses: makeDurationPropStatuses([
				nodePathInfo.sequenceSubscriptionKey,
			]),
		}),
	).toEqual([
		{
			fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
			initialDuration: 78,
			nodePath: nodePathInfo.sequenceSubscriptionKey,
			schema: Internals.baseSchema,
		},
	]);
});

test('Timeline duration drag supports interactive Series.Sequence rows', () => {
	const baseSequence = makeTimelineSequence({
		schema: Internals.baseSchema,
		duration: 78,
	});
	const seriesSequence = {
		...baseSequence,
		isInsideSeries: true,
		controls: {
			...baseSequence.controls!,
			componentIdentity: 'dev.remotion.remotion.Series.Sequence',
		},
	} satisfies TSequence;

	expect(isTimelineSequenceDurationDraggable(seriesSequence)).toBe(true);
});

test('Timeline duration drag clamps each selected sequence to one frame', () => {
	expect(
		getTimelineSequenceDurationDragValue({
			initialDuration: 4,
			deltaFrames: -10,
		}),
	).toBe(1);
	expect(
		getTimelineSequenceDurationDragValue({
			initialDuration: 20,
			deltaFrames: -10,
		}),
	).toBe(10);
});

test('Timeline duration drag is blocked if one selected sequence cannot update duration', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const propStatuses = makeDurationPropStatuses([
		firstNodePathInfo.sequenceSubscriptionKey,
	]);

	propStatuses[
		Internals.makeSequencePropsSubscriptionKey(
			secondNodePathInfo.sequenceSubscriptionKey,
		)
	] = {
		canUpdate: true,
		props: {},
		effects: [],
	};

	expect(
		getTimelineSequenceDurationDragTargets({
			draggedNodePathInfo: firstNodePathInfo,
			selectedItems: [
				{type: 'sequence', nodePathInfo: firstNodePathInfo},
				{type: 'sequence', nodePathInfo: secondNodePathInfo},
			],
			sequences: [
				makeTimelineSequence({
					schema,
					id: 'first',
					overrideId: 'first',
					duration: 40,
				}),
				makeTimelineSequence({
					schema,
					id: 'second',
					overrideId: 'second',
					duration: 15,
					from: 10,
				}),
			],
			overrideIdsToNodePaths: {
				first: firstNodePathInfo.sequenceSubscriptionKey,
				second: secondNodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses,
		}),
	).toBe(null);
});

test('Timeline duration drag is blocked if one selected sequence duration is keyframed', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const propStatuses = makeDurationPropStatuses([
		firstNodePathInfo.sequenceSubscriptionKey,
		secondNodePathInfo.sequenceSubscriptionKey,
	]);

	propStatuses[
		Internals.makeSequencePropsSubscriptionKey(
			secondNodePathInfo.sequenceSubscriptionKey,
		)
	] = {
		canUpdate: true,
		props: {
			durationInFrames: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [{frame: 0, value: 15}],
				easing: [{type: 'linear'}],
				clamping: {left: 'clamp', right: 'clamp'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	expect(
		getTimelineSequenceDurationDragTargets({
			draggedNodePathInfo: firstNodePathInfo,
			selectedItems: [
				{type: 'sequence', nodePathInfo: firstNodePathInfo},
				{type: 'sequence', nodePathInfo: secondNodePathInfo},
			],
			sequences: [
				makeTimelineSequence({
					schema,
					id: 'first',
					overrideId: 'first',
					duration: 40,
				}),
				makeTimelineSequence({
					schema,
					id: 'second',
					overrideId: 'second',
					duration: 15,
					from: 10,
				}),
			],
			overrideIdsToNodePaths: {
				first: firstNodePathInfo.sequenceSubscriptionKey,
				second: secondNodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses,
		}),
	).toBe(null);
});

test('Timeline duration drag ignores selection if dragged sequence is not selected', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const thirdNodePathInfo = makeNodePathInfo(['body', 2], []);
	const targets = getTimelineSequenceDurationDragTargets({
		draggedNodePathInfo: firstNodePathInfo,
		selectedItems: [
			{type: 'sequence', nodePathInfo: secondNodePathInfo},
			{type: 'sequence', nodePathInfo: thirdNodePathInfo},
		],
		sequences: [
			makeTimelineSequence({
				schema,
				id: 'first',
				overrideId: 'first',
				duration: 40,
			}),
			makeTimelineSequence({
				schema,
				id: 'second',
				overrideId: 'second',
				duration: 15,
				from: 10,
			}),
			makeTimelineSequence({
				schema,
				id: 'third',
				overrideId: 'third',
				duration: 25,
				from: 20,
			}),
		],
		overrideIdsToNodePaths: {
			first: firstNodePathInfo.sequenceSubscriptionKey,
			second: secondNodePathInfo.sequenceSubscriptionKey,
			third: thirdNodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeDurationPropStatuses([
			firstNodePathInfo.sequenceSubscriptionKey,
			secondNodePathInfo.sequenceSubscriptionKey,
			thirdNodePathInfo.sequenceSubscriptionKey,
		]),
	});

	expect(targets?.map((target) => target.nodePath)).toEqual([
		firstNodePathInfo.sequenceSubscriptionKey,
	]);
});

test('Timeline left edge drag adjusts from, duration and trimBefore for selected sequences', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const targets = getTimelineSequenceLeftEdgeDragTargets({
		draggedNodePathInfo: firstNodePathInfo,
		selectedItems: [
			{type: 'sequence', nodePathInfo: firstNodePathInfo},
			{type: 'sequence', nodePathInfo: secondNodePathInfo},
		],
		sequences: [
			makeTimelineSequence({
				schema,
				id: 'first',
				overrideId: 'first',
				duration: 40,
				from: 5,
			}),
			makeTimelineSequence({
				schema,
				id: 'second',
				overrideId: 'second',
				duration: 15,
				from: 10,
				type: 'image',
			}),
		],
		overrideIdsToNodePaths: {
			first: firstNodePathInfo.sequenceSubscriptionKey,
			second: secondNodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeLeftEdgePropStatuses(
			[
				firstNodePathInfo.sequenceSubscriptionKey,
				secondNodePathInfo.sequenceSubscriptionKey,
			],
			true,
		),
	});

	expect(
		getTimelineSequenceLeftEdgeDragChanges({
			targets: targets ?? [],
			deltaFrames: 6,
		}).map((change) => [change.fieldKey, change.value]),
	).toEqual([
		['from', 11],
		['durationInFrames', 34],
		['trimBefore', 6],
		['from', 16],
		['durationInFrames', 9],
		['trimBefore', 6],
	]);
});

test('Timeline left edge drag clamps trimBefore to the visible range', () => {
	expect(
		getTimelineSequenceLeftEdgeDragValues({
			initialDuration: 4,
			initialFrom: 20,
			initialTrimBefore: 2,
			deltaFrames: 10,
		}),
	).toEqual({
		durationInFrames: 1,
		from: 23,
		trimBefore: 5,
	});
	expect(
		getTimelineSequenceLeftEdgeDragValues({
			initialDuration: 4,
			initialFrom: 20,
			initialTrimBefore: 2,
			deltaFrames: -10,
		}),
	).toEqual({
		durationInFrames: 6,
		from: 18,
		trimBefore: 0,
	});
});

test('Timeline left edge drag adjusts and clamps media trimBefore', () => {
	const schema = {} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const targets = getTimelineSequenceLeftEdgeDragTargets({
		draggedNodePathInfo: nodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				duration: 40,
				from: 12,
				startMediaFrom: 8,
				type: 'video',
			}),
		],
		overrideIdsToNodePaths: {
			override: nodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeLeftEdgePropStatuses(
			[nodePathInfo.sequenceSubscriptionKey],
			true,
		),
	});

	expect(targets?.map((target) => target.initialTrimBefore)).toEqual([8]);
	expect(
		getTimelineSequenceLeftEdgeDragChanges({
			targets: targets ?? [],
			deltaFrames: -20,
		}).map((change) => [change.fieldKey, change.value]),
	).toEqual([
		['from', 4],
		['durationInFrames', 48],
		['trimBefore', 0],
	]);
});

test('Timeline left edge drag is blocked without timeline range props', () => {
	const schema = {} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const targets = getTimelineSequenceLeftEdgeDragTargets({
		draggedNodePathInfo: nodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				duration: 40,
				from: 0,
				startMediaFrom: 8,
				type: 'video',
			}),
		],
		overrideIdsToNodePaths: {
			override: nodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeLeftEdgePropStatuses(
			[nodePathInfo.sequenceSubscriptionKey],
			true,
			false,
		),
	});

	expect(targets).toBe(null);
});

test('Timeline left edge drag is blocked if trimBefore cannot update', () => {
	const schema = {} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], []);

	expect(
		getTimelineSequenceLeftEdgeDragTargets({
			draggedNodePathInfo: nodePathInfo,
			selectedItems: [{type: 'sequence', nodePathInfo}],
			sequences: [
				makeTimelineSequence({
					schema,
					type: 'audio',
				}),
			],
			overrideIdsToNodePaths: {
				override: nodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses: makeLeftEdgePropStatuses([
				nodePathInfo.sequenceSubscriptionKey,
			]),
		}),
	).toBe(null);
});

test('Timeline from drag applies the same delta to selected sequences', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const sequences = [
		makeTimelineSequence({
			schema,
			id: 'first',
			overrideId: 'first',
			duration: 40,
			from: 0,
		}),
		makeTimelineSequence({
			schema,
			id: 'second',
			overrideId: 'second',
			duration: 15,
			from: 10,
			type: 'audio',
		}),
	];
	const targets = getTimelineSequenceFromDragTargets({
		draggedNodePathInfo: firstNodePathInfo,
		selectedItems: [
			{type: 'sequence', nodePathInfo: firstNodePathInfo},
			{type: 'sequence', nodePathInfo: secondNodePathInfo},
		],
		sequences,
		overrideIdsToNodePaths: {
			first: firstNodePathInfo.sequenceSubscriptionKey,
			second: secondNodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeFromPropStatuses([
			firstNodePathInfo.sequenceSubscriptionKey,
			secondNodePathInfo.sequenceSubscriptionKey,
		]),
	});

	expect(targets?.map((target) => target.initialFrom)).toEqual([0, 10]);
	expect(
		getTimelineSequenceFromDragChanges({
			targets: targets ?? [],
			deltaFrames: 12,
		}).map((change) => change.value),
	).toEqual([12, 22]);
});

test('Timeline from drag moves all owned sequence keyframes by the same delta', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = makeFromPropStatuses([nodePath]);
	propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] = {
		canUpdate: true,
		props: {
			from: {status: 'static', codeValue: 0},
			'style.translate': {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: '0px 0px'},
					{frame: 40, value: '100px 50px'},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
			opacity: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 10, value: 0},
					{frame: 20, value: 1},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'clamp', right: 'clamp'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};
	const targets = getTimelineSequenceFromDragTargets({
		draggedNodePathInfo: nodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				duration: 40,
				from: 0,
			}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(
		getTimelineSequenceFromDragKeyframeMoves({
			targets: targets ?? [],
			deltaFrames: 12,
		}).sequenceKeyframes.map((keyframe) => [
			keyframe.fieldKey,
			keyframe.fromFrame,
			keyframe.toFrame,
		]),
	).toEqual([
		['style.translate', 0, 12],
		['style.translate', 40, 52],
		['opacity', 10, 22],
		['opacity', 20, 32],
	]);
});

test('Timeline from drag moves owned effect keyframes by the same delta', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(['body', 0], [], true, [
		['0', 'intensity'],
	]);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = makeFromPropStatuses([nodePath]);
	propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] = {
		canUpdate: true,
		props: {
			from: {status: 'static', codeValue: 0},
		},
		effects: [
			{
				canUpdate: true,
				callee: 'halftone',
				importPath: '@remotion/effects/halftone',
				effectIndex: 0,
				props: {
					intensity: {
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 5, value: 10},
							{frame: 25, value: 20},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'clamp', right: 'clamp'},
						posterize: undefined,
						output: undefined,
					},
				},
			},
		],
	};
	const targets = getTimelineSequenceFromDragTargets({
		draggedNodePathInfo: nodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				effects: [{schema: effectSchema}],
			}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(
		getTimelineSequenceFromDragKeyframeMoves({
			targets: targets ?? [],
			deltaFrames: -7,
		}).effectKeyframes.map((keyframe) => [
			keyframe.effectIndex,
			keyframe.fieldKey,
			keyframe.fromFrame,
			keyframe.toFrame,
		]),
	).toEqual([
		[0, 'intensity', 5, -2],
		[0, 'intensity', 25, 18],
	]);
});

test('Timeline from drag supports negative offsets', () => {
	expect(
		getTimelineSequenceFromDragValue({
			initialFrom: 4,
			deltaFrames: -10,
		}),
	).toBe(-6);
});

test('Timeline from drag saves relative from for nested sequences', () => {
	const schema = {} satisfies InteractivitySchema;
	const childNodePathInfo = makeNodePathInfo(['body', 1], []);
	const targets = getTimelineSequenceFromDragTargets({
		draggedNodePathInfo: childNodePathInfo,
		selectedItems: [{type: 'sequence', nodePathInfo: childNodePathInfo}],
		sequences: [
			makeTimelineSequence({
				schema,
				id: 'parent',
				overrideId: 'parent',
				duration: 100,
				from: 50,
			}),
			makeTimelineSequence({
				schema,
				id: 'child',
				overrideId: 'child',
				duration: 20,
				from: 10,
				parentId: 'parent',
			}),
		],
		overrideIdsToNodePaths: {
			child: childNodePathInfo.sequenceSubscriptionKey,
		},
		propStatuses: makeFromPropStatuses([
			childNodePathInfo.sequenceSubscriptionKey,
		]),
	});

	expect(targets?.map((target) => target.initialFrom)).toEqual([10]);
	expect(
		getTimelineSequenceFromDragChanges({
			targets: targets ?? [],
			deltaFrames: 5,
		}).map((change) => change.value),
	).toEqual([15]);
});

test('Timeline from drag is blocked if one selected sequence cannot update from', () => {
	const schema = {} satisfies InteractivitySchema;
	const firstNodePathInfo = makeNodePathInfo(['body', 0], []);
	const secondNodePathInfo = makeNodePathInfo(['body', 1], []);
	const propStatuses = makeFromPropStatuses([
		firstNodePathInfo.sequenceSubscriptionKey,
	]);

	propStatuses[
		Internals.makeSequencePropsSubscriptionKey(
			secondNodePathInfo.sequenceSubscriptionKey,
		)
	] = {
		canUpdate: true,
		props: {},
		effects: [],
	};

	expect(
		getTimelineSequenceFromDragTargets({
			draggedNodePathInfo: firstNodePathInfo,
			selectedItems: [
				{type: 'sequence', nodePathInfo: firstNodePathInfo},
				{type: 'sequence', nodePathInfo: secondNodePathInfo},
			],
			sequences: [
				makeTimelineSequence({
					schema,
					id: 'first',
					overrideId: 'first',
					duration: 40,
				}),
				makeTimelineSequence({
					schema,
					id: 'second',
					overrideId: 'second',
					duration: 15,
					from: 10,
				}),
			],
			overrideIdsToNodePaths: {
				first: firstNodePathInfo.sequenceSubscriptionKey,
				second: secondNodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses,
		}),
	).toBe(null);
});

test('Timeline from drag removes the prop at the default value', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], []);
	const [change] = getTimelineSequenceFromDragChanges({
		targets: [
			{
				effectKeyframes: [],
				fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
				initialFrom: 5,
				nodePath: nodePathInfo.sequenceSubscriptionKey,
				sequenceKeyframes: [],
			},
		],
		deltaFrames: -5,
	});

	expect(change).toEqual({
		fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
		nodePath: nodePathInfo.sequenceSubscriptionKey,
		fieldKey: 'from',
		value: 0,
		defaultValue: '0',
		schema: NoReactInternals.sequenceSchema,
	});
});

test('Timeline colors use the outlines palette', () => {
	expect(TIMELINE_BACKGROUND).toBe('#0F1113');
	expect(TIMELINE_TICKS_BACKGROUND).not.toBe(TIMELINE_BACKGROUND);
});

test('Timeline outlines visibility is enabled by default and persisted', () => {
	withMockLocalStorage(() => {
		expect(loadEditorShowOutlinesOption()).toBe(true);

		persistEditorShowOutlinesOption(false);
		expect(loadEditorShowOutlinesOption()).toBe(false);

		persistEditorShowOutlinesOption(true);
		expect(loadEditorShowOutlinesOption()).toBe(true);
	});
});

test('Canvas outline selection uses conventional modifier keys', () => {
	expect(
		getOutlineSelectionInteraction({
			shiftKey: true,
			metaKey: false,
			ctrlKey: false,
		}),
	).toEqual({shiftKey: true, toggleKey: false});
	expect(
		getOutlineSelectionInteraction({
			shiftKey: false,
			metaKey: true,
			ctrlKey: false,
		}),
	).toEqual({shiftKey: false, toggleKey: true});
	expect(
		getOutlineSelectionInteraction({
			shiftKey: false,
			metaKey: false,
			ctrlKey: true,
		}),
	).toEqual({shiftKey: false, toggleKey: true});
});

test('Canvas outline double-click only handles opening the editor', () => {
	expect(getOutlineDoubleClickAction({button: 0, canOpenInEditor: true})).toBe(
		'open-in-editor',
	);
	expect(getOutlineDoubleClickAction({button: 0, canOpenInEditor: false})).toBe(
		null,
	);
	expect(
		getOutlineDoubleClickAction({button: 2, canOpenInEditor: true}),
	).toBeNull();
});

test('Canvas outline hit targets render nested sequences above parents', () => {
	const schema = {} satisfies InteractivitySchema;
	const refForOutline = {current: null};
	const parentNodePathInfo = makeNodePathInfo(['body', 0], []);
	const childNodePathInfo = makeNodePathInfo(['body', 0, 'children', 0], []);
	const outlines = getSequencesWithSelectableOutlines({
		sequences: [
			makeTimelineSequence({
				schema,
				id: 'parent',
				overrideId: 'parent',
				refForOutline,
			}),
			makeTimelineSequence({
				schema,
				id: 'child',
				overrideId: 'child',
				parentId: 'parent',
				refForOutline,
			}),
		],
		overrideIdsToNodePaths: {
			parent: parentNodePathInfo.sequenceSubscriptionKey,
			child: childNodePathInfo.sequenceSubscriptionKey,
		},
	});

	expect(outlines.map((outline) => outline.key)).toEqual([
		getTimelineSequenceSelectionKey(parentNodePathInfo),
		getTimelineSequenceSelectionKey(childNodePathInfo),
	]);
});

test('Canvas outline rendering preserves unconstrained outline order', () => {
	const makeOutline = (key: string): SelectedOutline => ({
		key,
		dimensions: null,
		points: [
			{x: 0, y: 0},
			{x: 10, y: 0},
			{x: 10, y: 10},
			{x: 0, y: 10},
		],
	});
	const makeTarget = (selected: boolean): SelectedOutlineTarget =>
		({selected}) as SelectedOutlineTarget;

	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeOutline('parent'),
			makeOutline('child'),
			makeOutline('sibling'),
		],
		sequences: [],
		targetsByKey: new Map([
			['parent', makeTarget(true)],
			['child', makeTarget(false)],
			['sibling', makeTarget(false)],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'parent',
		'child',
		'sibling',
	]);
});

const makeTestOutline = ({
	key,
	left,
	top,
	width,
	height,
}: {
	readonly key: string;
	readonly left: number;
	readonly top: number;
	readonly width: number;
	readonly height: number;
}): SelectedOutline => ({
	key,
	dimensions: {width, height},
	points: [
		{x: left, y: top},
		{x: left + width, y: top},
		{x: left + width, y: top + height},
		{x: left, y: top + height},
	],
});

const makeOutlineTarget = ({
	id,
	parent,
	selected = false,
}: {
	readonly id: string;
	readonly parent: string | null;
	readonly selected?: boolean;
}): SelectedOutlineTarget =>
	({
		selected,
		sequence: {id, parent},
	}) as SelectedOutlineTarget;

const makeOutlineSequence = ({
	id,
	parent,
}: {
	readonly id: string;
	readonly parent: string | null;
}) => ({id, parent});

test('Canvas outline rendering keeps smaller nested hit targets above parents', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'parent',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'child',
				left: 25,
				top: 25,
				width: 50,
				height: 50,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'parent', parent: null}),
			makeOutlineSequence({id: 'child', parent: 'parent'}),
		],
		targetsByKey: new Map([
			['parent', makeOutlineTarget({id: 'parent', parent: null})],
			['child', makeOutlineTarget({id: 'child', parent: 'parent'})],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'parent',
		'child',
	]);
});

test('Canvas outline rendering puts equal-area child hit targets below parents', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'parent',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'container',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'label',
				left: 25,
				top: 25,
				width: 50,
				height: 50,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'parent', parent: null}),
			makeOutlineSequence({id: 'container', parent: 'parent'}),
			makeOutlineSequence({id: 'label', parent: 'container'}),
		],
		targetsByKey: new Map([
			['parent', makeOutlineTarget({id: 'parent', parent: null})],
			['container', makeOutlineTarget({id: 'container', parent: 'parent'})],
			['label', makeOutlineTarget({id: 'label', parent: 'container'})],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'container',
		'parent',
		'label',
	]);
});

test('Canvas outline rendering keeps equal-area children containing selection above parents', () => {
	const outlines = [
		makeTestOutline({
			key: 'parent',
			left: 0,
			top: 0,
			width: 100,
			height: 100,
		}),
		makeTestOutline({
			key: 'child',
			left: 0,
			top: 0,
			width: 100,
			height: 100,
		}),
	];
	const sequences = [
		makeOutlineSequence({id: 'parent', parent: null}),
		makeOutlineSequence({id: 'child', parent: 'parent'}),
	];

	for (const selectionState of [{selected: true}, {containsSelection: true}]) {
		const orderedOutlines = orderOutlinesForRendering({
			outlines,
			sequences,
			targetsByKey: new Map([
				['parent', makeOutlineTarget({id: 'parent', parent: null})],
				[
					'child',
					{
						...makeOutlineTarget({id: 'child', parent: 'parent'}),
						...selectionState,
					},
				],
			]),
		});

		expect(orderedOutlines.map((outline) => outline.key)).toEqual([
			'parent',
			'child',
		]);
	}
});

test('Canvas outline rendering handles transitive subpixel equivalence', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'parent',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'child',
				left: 0.4,
				top: 0.4,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'grandchild',
				left: 0.8,
				top: 0.8,
				width: 100,
				height: 100,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'parent', parent: null}),
			makeOutlineSequence({id: 'child', parent: 'parent'}),
			makeOutlineSequence({id: 'grandchild', parent: 'child'}),
		],
		targetsByKey: new Map([
			['parent', makeOutlineTarget({id: 'parent', parent: null})],
			['child', makeOutlineTarget({id: 'child', parent: 'parent'})],
			['grandchild', makeOutlineTarget({id: 'grandchild', parent: 'child'})],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'grandchild',
		'child',
		'parent',
	]);
});

test('Canvas outline equivalence ignores polygon start vertex and winding', () => {
	const parent = makeTestOutline({
		key: 'parent',
		left: 0,
		top: 0,
		width: 100,
		height: 100,
	});
	const child: SelectedOutline = {
		...makeTestOutline({
			key: 'child',
			left: 0,
			top: 0,
			width: 100,
			height: 100,
		}),
		points: [
			{x: 100, y: 100},
			{x: 100, y: 0},
			{x: 0, y: 0},
			{x: 0, y: 100},
		],
	};
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [parent, child],
		sequences: [
			makeOutlineSequence({id: 'parent', parent: null}),
			makeOutlineSequence({id: 'child', parent: 'parent'}),
		],
		targetsByKey: new Map([
			['parent', makeOutlineTarget({id: 'parent', parent: null})],
			['child', makeOutlineTarget({id: 'child', parent: 'parent'})],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'child',
		'parent',
	]);
});

test('Canvas outline rendering keeps lower-third wrappers reachable below larger overlapping sequences', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'lower-third-wrapper',
				left: 200,
				top: 854,
				width: 680,
				height: 138,
			}),
			makeTestOutline({
				key: 'overlapping-keyframed-sequence',
				left: 100,
				top: 700,
				width: 1000,
				height: 400,
			}),
			makeTestOutline({
				key: 'lower-third-container',
				left: 200,
				top: 854,
				width: 680,
				height: 138,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'lower-third-wrapper', parent: null}),
			makeOutlineSequence({
				id: 'overlapping-keyframed-sequence',
				parent: null,
			}),
			makeOutlineSequence({
				id: 'lower-third-container',
				parent: 'lower-third-wrapper',
			}),
		],
		targetsByKey: new Map([
			[
				'lower-third-wrapper',
				makeOutlineTarget({id: 'lower-third-wrapper', parent: null}),
			],
			[
				'overlapping-keyframed-sequence',
				makeOutlineTarget({
					id: 'overlapping-keyframed-sequence',
					parent: null,
					selected: true,
				}),
			],
			[
				'lower-third-container',
				makeOutlineTarget({
					id: 'lower-third-container',
					parent: 'lower-third-wrapper',
					selected: true,
				}),
			],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'overlapping-keyframed-sequence',
		'lower-third-wrapper',
		'lower-third-container',
	]);
});

test('Canvas outline rendering orders equal-area children deterministically with unrelated outlines', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'lower-third-wrapper',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'unrelated-keyframed-sequence',
				left: 200,
				top: 200,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'lower-third-container',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'lower-third-title',
				left: 25,
				top: 25,
				width: 50,
				height: 50,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'lower-third-wrapper', parent: null}),
			makeOutlineSequence({id: 'unrelated-keyframed-sequence', parent: null}),
			makeOutlineSequence({
				id: 'lower-third-container',
				parent: 'lower-third-wrapper',
			}),
			makeOutlineSequence({
				id: 'lower-third-title',
				parent: 'lower-third-container',
			}),
		],
		targetsByKey: new Map([
			[
				'lower-third-wrapper',
				makeOutlineTarget({id: 'lower-third-wrapper', parent: null}),
			],
			[
				'unrelated-keyframed-sequence',
				makeOutlineTarget({id: 'unrelated-keyframed-sequence', parent: null}),
			],
			[
				'lower-third-container',
				makeOutlineTarget({
					id: 'lower-third-container',
					parent: 'lower-third-wrapper',
				}),
			],
			[
				'lower-third-title',
				makeOutlineTarget({
					id: 'lower-third-title',
					parent: 'lower-third-container',
				}),
			],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'lower-third-container',
		'lower-third-wrapper',
		'unrelated-keyframed-sequence',
		'lower-third-title',
	]);
});

test('Canvas outline rendering follows hidden intermediate ancestors', () => {
	const orderedOutlines = orderOutlinesForRendering({
		outlines: [
			makeTestOutline({
				key: 'visible-parent',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			makeTestOutline({
				key: 'visible-child',
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
		],
		sequences: [
			makeOutlineSequence({id: 'visible-parent', parent: null}),
			makeOutlineSequence({id: 'hidden-wrapper', parent: 'visible-parent'}),
			makeOutlineSequence({id: 'visible-child', parent: 'hidden-wrapper'}),
		],
		targetsByKey: new Map([
			[
				'visible-parent',
				makeOutlineTarget({id: 'visible-parent', parent: null}),
			],
			[
				'visible-child',
				makeOutlineTarget({id: 'visible-child', parent: 'hidden-wrapper'}),
			],
		]),
	});

	expect(orderedOutlines.map((outline) => outline.key)).toEqual([
		'visible-child',
		'visible-parent',
	]);
});

test('Canvas outline hit targets exclude sequences hidden from the timeline', () => {
	const schema = {} satisfies InteractivitySchema;
	const refForOutline = {current: null};
	const hiddenNodePathInfo = makeNodePathInfo(['body', 0], []);
	const visibleNodePathInfo = makeNodePathInfo(['body', 1], []);
	const childNodePathInfo = makeNodePathInfo(['body', 0, 'children', 0], []);
	const outlines = getSequencesWithSelectableOutlines({
		sequences: [
			makeTimelineSequence({
				schema,
				id: 'hidden',
				overrideId: 'hidden',
				refForOutline,
				showInTimeline: false,
			}),
			makeTimelineSequence({
				schema,
				id: 'visible',
				overrideId: 'visible',
				refForOutline,
			}),
			makeTimelineSequence({
				schema,
				id: 'child',
				overrideId: 'child',
				parentId: 'hidden',
				refForOutline,
			}),
		],
		overrideIdsToNodePaths: {
			hidden: hiddenNodePathInfo.sequenceSubscriptionKey,
			visible: visibleNodePathInfo.sequenceSubscriptionKey,
			child: childNodePathInfo.sequenceSubscriptionKey,
		},
	});

	expect(outlines.map((outline) => outline.key).sort()).toEqual(
		[
			getTimelineSequenceSelectionKey(visibleNodePathInfo),
			getTimelineSequenceSelectionKey(childNodePathInfo),
		].sort(),
	);
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

test('Transform origin parser supports keywords, percentages, px and z', () => {
	const keyword = parseTransformOrigin('left bottom');
	expect(keyword).not.toBeNull();
	expect(
		parsedTransformOriginToUv({
			parsed: keyword!,
			width: 200,
			height: 100,
		}),
	).toEqual([0, 1]);

	const px = parseTransformOrigin('100px 25% 10px');
	expect(px).not.toBeNull();
	expect(
		parsedTransformOriginToUv({
			parsed: px!,
			width: 200,
			height: 100,
		}),
	).toEqual([0.5, 0.25]);
	expect(serializeTransformOrigin({uv: [0.5, 0.25], z: px!.z})).toBe(
		'50% 25% 10px',
	);
});

test('Transform origin parser rejects unsupported calc values', () => {
	expect(parseTransformOrigin('calc(50% + 10px) 50%')).toBeNull();
});

test('Transform origin compensation keeps rotated and scaled elements in place', () => {
	const next = compensateTranslateForTransformOrigin({
		startTranslate: [20, 30],
		deltaOrigin: [10, 5],
		rotate: Math.PI / 2,
		scale: [2, 3],
	});

	expect(next[0]).toBeCloseTo(-5, 5);
	expect(next[1]).toBeCloseTo(45, 5);
});

test('Transform origin drag snaps to center, edge midpoints and corners', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	expect(
		snapSelectedOutlineTransformOriginUv({
			point: {x: 47, y: 53},
			points,
			uv: getUvCoordinateForPoint(points, {x: 47, y: 53}),
		}),
	).toEqual([0.5, 0.5]);
	expect(
		snapSelectedOutlineTransformOriginUv({
			point: {x: 52, y: 4},
			points,
			uv: getUvCoordinateForPoint(points, {x: 52, y: 4}),
		}),
	).toEqual([0.5, 0]);
	expect(
		snapSelectedOutlineTransformOriginUv({
			point: {x: 96, y: 49},
			points,
			uv: getUvCoordinateForPoint(points, {x: 96, y: 49}),
		}),
	).toEqual([1, 0.5]);
	expect(
		snapSelectedOutlineTransformOriginUv({
			point: {x: 3, y: 96},
			points,
			uv: getUvCoordinateForPoint(points, {x: 3, y: 96}),
		}),
	).toEqual([0, 1]);
});

test('Transform origin drag snaps to rotated outline anchors', () => {
	const points = [
		{x: 10, y: 20},
		{x: 90, y: 50},
		{x: 70, y: 110},
		{x: -10, y: 80},
	] as const;
	const topMiddle = getUvHandlePosition(points, [0.5, 0]);
	const pointer = {x: topMiddle.x + 4, y: topMiddle.y - 3};

	expect(
		snapSelectedOutlineTransformOriginUv({
			point: pointer,
			points,
			uv: getUvCoordinateForPoint(points, pointer),
		}),
	).toEqual([0.5, 0]);
});

test('Transform origin drag does not snap outside the magnetic threshold', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;
	const pointer = {
		x: 50,
		y: selectedOutlineTransformOriginSnapThresholdPx + 1,
	};
	const uv = getUvCoordinateForPoint(points, pointer);
	const snapped = snapSelectedOutlineTransformOriginUv({
		point: pointer,
		points,
		uv,
	});

	expect(snapped[0]).toBeCloseTo(uv[0], 5);
	expect(snapped[1]).toBeCloseTo(uv[1], 5);
});

test('UV coordinate drag snaps to outline anchors', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	expect(
		snapSelectedOutlineUv({
			point: {x: 47, y: 53},
			points,
			uv: getUvCoordinateForPoint(points, {x: 47, y: 53}),
		}),
	).toEqual([0.5, 0.5]);
	expect(
		snapSelectedOutlineUv({
			point: {x: 96, y: 49},
			points,
			uv: getUvCoordinateForPoint(points, {x: 96, y: 49}),
		}),
	).toEqual([1, 0.5]);

	const pointer = {
		x: 50,
		y: selectedOutlineUvSnapThresholdPx + 1,
	};
	const uv = getUvCoordinateForPoint(points, pointer);
	const snapped = snapSelectedOutlineUv({
		point: pointer,
		points,
		uv,
	});

	expect(snapped[0]).toBeCloseTo(uv[0], 5);
	expect(snapped[1]).toBeCloseTo(uv[1], 5);
});

test('Transform origin axis locking keeps one UV axis fixed', () => {
	const dimensions = {width: 200, height: 100};
	const startUv = [0.25, 0.5] as const;
	const mostlyHorizontal = [0.5, 0.75] as const;
	const mostlyVertical = [0.35, 0.9] as const;

	expect(
		getSelectedOutlineTransformOriginLockedAxis({
			axisLocked: true,
			dimensions,
			startUv,
			uv: mostlyHorizontal,
		}),
	).toBe('x');
	expect(
		applySelectedOutlineTransformOriginAxisLock({
			lockedAxis: 'x',
			startUv,
			uv: mostlyHorizontal,
		}),
	).toEqual([0.5, 0.5]);
	expect(
		getSelectedOutlineTransformOriginLockedAxis({
			axisLocked: true,
			dimensions,
			startUv,
			uv: mostlyVertical,
		}),
	).toBe('y');
	expect(
		applySelectedOutlineTransformOriginAxisLock({
			lockedAxis: 'y',
			startUv,
			uv: mostlyVertical,
		}),
	).toEqual([0.25, 0.9]);
	expect(
		getSelectedOutlineTransformOriginLockedAxis({
			axisLocked: false,
			dimensions,
			startUv,
			uv: mostlyVertical,
		}),
	).toBeNull();
	expect(
		applySelectedOutlineTransformOriginAxisLock({
			lockedAxis: null,
			startUv,
			uv: mostlyVertical,
		}),
	).toBe(mostlyVertical);
	expect(
		getSelectedOutlineTransformOriginLockedAxis({
			axisLocked: true,
			dimensions,
			startUv,
			uv: mostlyVertical,
		}),
	).toBe('y');
});

test('UV coordinate constraints preserve precision despite schema step', () => {
	expect(
		constrainUv([0.123456, 0.987654], {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			step: 0.01,
		}),
	).toEqual([0.123456, 0.987654]);
});

test('UV coordinate constraints still clamp to schema min and max', () => {
	expect(
		constrainUv([-0.123456, 1.987654], {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			min: 0,
			max: 1,
			step: 0.01,
		}),
	).toEqual([0, 1]);
});

test('UV coordinates round to three decimals by default when dragging', () => {
	expect(
		roundUvCoordinate([0.123456, 0.987654], {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			step: 0.01,
		}),
	).toEqual([0.123, 0.988]);
});

test('UV coordinates allow finer configured steps when dragging', () => {
	expect(
		roundUvCoordinate([0.123456, 0.987654], {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			step: 0.0001,
		}),
	).toEqual([0.1235, 0.9877]);
});

test('SVG viewport outline points are projected through the screen CTM', () => {
	const points = getTransformedSvgViewportPoints({
		viewport: {x: 0, y: 0, width: 100, height: 50},
		ctm: {a: 0, b: 1, c: -1, d: 0, e: 75, f: -25},
		containerRect: {left: 10, top: 20},
	});

	expect(points).toEqual([
		{x: 65, y: -45},
		{x: 65, y: 55},
		{x: 15, y: 55},
		{x: 15, y: -45},
	]);
});

test('UV handle connection lines connect fields from schema metadata', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	const lines = getUvHandleConnectionLines({
		points,
		handles: [
			{
				effectIndex: 0,
				fieldKey: 'start',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [0, 0],
					visual: {
						type: 'line',
						to: 'end',
					},
				},
				value: [0.2, 0.3],
			},
			{
				effectIndex: 0,
				fieldKey: 'end',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [1, 1],
				},
				value: [0.8, 0.7],
			},
		],
	});

	expect(lines).toEqual([
		{
			key: '0-start-end',
			from: {x: 20, y: 30},
			to: {x: 80, y: 70},
		},
	]);
});

test('UV handle connection lines stay within the same effect instance', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	const lines = getUvHandleConnectionLines({
		points,
		handles: [
			{
				effectIndex: 0,
				fieldKey: 'start',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [0, 0],
					visual: {
						type: 'line',
						to: 'end',
					},
				},
				value: [0.2, 0.3],
			},
			{
				effectIndex: 1,
				fieldKey: 'end',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [1, 1],
				},
				value: [0.8, 0.7],
			},
			{
				effectIndex: 2,
				fieldKey: 'start',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [0, 0],
					visual: {
						type: 'line',
						to: 'end',
					},
				},
				value: [0.2, 0.3],
			},
			{
				effectIndex: 2,
				fieldKey: 'end',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [1, 1],
					visual: {
						type: 'line',
						to: 'start',
					},
				},
				value: [0.8, 0.7],
			},
		],
	});

	expect(lines.map((line) => line.key)).toEqual(['2-start-end']);
});

test('UV handle connection ellipses use numeric ellipse fields from schema metadata', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	const ellipses = getUvHandleConnectionEllipses({
		points,
		handles: [
			{
				effectIndex: 0,
				fieldKey: 'center',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [0.5, 0.5],
					visual: {
						type: 'ellipse',
						width: 'width',
						height: 'height',
						rotation: 'rotation',
						innerScale: 'start',
					},
				},
				effectValues: {
					width: 0.6,
					height: 0.4,
					rotation: 90,
					start: 0.5,
				},
				value: [0.5, 0.5],
			},
		],
	});

	expect(ellipses).toHaveLength(2);
	expect(ellipses[0].key).toBe('0-center-width-height-rotation');
	expect(ellipses[0].points[0].x).toBeCloseTo(50);
	expect(ellipses[0].points[0].y).toBeCloseTo(80);
	expect(ellipses[0].points[16].x).toBeCloseTo(30);
	expect(ellipses[0].points[16].y).toBeCloseTo(50);
	expect(ellipses[0].points[32].x).toBeCloseTo(50);
	expect(ellipses[0].points[32].y).toBeCloseTo(20);
	expect(ellipses[0].points[48].x).toBeCloseTo(70);
	expect(ellipses[0].points[48].y).toBeCloseTo(50);
	expect(ellipses[1].key).toBe('0-center-width-height-rotation-start');
	expect(ellipses[1].points[0].x).toBeCloseTo(50);
	expect(ellipses[1].points[0].y).toBeCloseTo(65);
	expect(ellipses[1].points[16].x).toBeCloseTo(40);
	expect(ellipses[1].points[16].y).toBeCloseTo(50);
	expect(ellipses[1].points[32].x).toBeCloseTo(50);
	expect(ellipses[1].points[32].y).toBeCloseTo(35);
	expect(ellipses[1].points[48].x).toBeCloseTo(60);
	expect(ellipses[1].points[48].y).toBeCloseTo(50);
});

test('UV handle connection ellipses rotate numeric fields in pixel space', () => {
	const points = [
		{x: 0, y: 0},
		{x: 200, y: 0},
		{x: 200, y: 100},
		{x: 0, y: 100},
	] as const;

	const ellipses = getUvHandleConnectionEllipses({
		dimensions: {width: 200, height: 100},
		points,
		handles: [
			{
				effectIndex: 0,
				fieldKey: 'center',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [0.5, 0.5],
					visual: {
						type: 'ellipse',
						width: 'width',
						height: 'height',
						rotation: 'rotation',
						innerScale: 'start',
					},
				},
				effectValues: {
					width: 0.6,
					height: 0.4,
					rotation: 90,
					start: 0.5,
				},
				value: [0.5, 0.5],
			},
		],
	});

	expect(ellipses).toHaveLength(2);
	expect(ellipses[0].points[0].x).toBeCloseTo(100);
	expect(ellipses[0].points[0].y).toBeCloseTo(110);
	expect(ellipses[0].points[16].x).toBeCloseTo(80);
	expect(ellipses[0].points[16].y).toBeCloseTo(50);
	expect(ellipses[0].points[32].x).toBeCloseTo(100);
	expect(ellipses[0].points[32].y).toBeCloseTo(-10);
	expect(ellipses[0].points[48].x).toBeCloseTo(120);
	expect(ellipses[0].points[48].y).toBeCloseTo(50);
	expect(ellipses[1].points[0].x).toBeCloseTo(100);
	expect(ellipses[1].points[0].y).toBeCloseTo(80);
	expect(ellipses[1].points[16].x).toBeCloseTo(90);
	expect(ellipses[1].points[16].y).toBeCloseTo(50);
	expect(ellipses[1].points[32].x).toBeCloseTo(100);
	expect(ellipses[1].points[32].y).toBeCloseTo(20);
	expect(ellipses[1].points[48].x).toBeCloseTo(110);
	expect(ellipses[1].points[48].y).toBeCloseTo(50);
});

test('UV ellipse interactive controls expose resize and rotation handles', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;
	const nodePath = makeKey(['body', 0]);
	const schema = {
		center: {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			visual: {
				type: 'ellipse',
				width: 'width',
				height: 'height',
				rotation: 'rotation',
				innerScale: 'start',
			},
		},
		width: {
			type: 'number',
			default: 0.6,
			hiddenFromList: false,
		},
		height: {
			type: 'number',
			default: 0.4,
			hiddenFromList: false,
		},
		rotation: {
			type: 'rotation-degrees',
			default: 90,
		},
		start: {
			type: 'number',
			default: 0.5,
			hiddenFromList: false,
		},
	} as const satisfies InteractivitySchema;
	const handle = {
		clientId: 'client-id',
		effectIndex: 0,
		effectValues: {
			center: [0.5, 0.5],
			width: 0.6,
			height: 0.4,
			rotation: 90,
			start: 0.5,
		},
		ellipseControls: {
			width: {
				fieldKey: 'width',
				fieldSchema: schema.width,
				fieldDefault: schema.width.default,
				propStatus: {status: 'static', codeValue: 0.6},
				value: 0.6,
			},
			height: {
				fieldKey: 'height',
				fieldSchema: schema.height,
				fieldDefault: schema.height.default,
				propStatus: {status: 'static', codeValue: 0.4},
				value: 0.4,
			},
			rotation: {
				fieldKey: 'rotation',
				fieldSchema: schema.rotation,
				fieldDefault: schema.rotation.default,
				propStatus: {status: 'static', codeValue: 90},
				value: 90,
			},
			start: {
				fieldKey: 'start',
				fieldSchema: schema.start,
				fieldDefault: schema.start.default,
				propStatus: {status: 'static', codeValue: 0.5},
				value: 0.5,
			},
		},
		fieldDefault: schema.center.default,
		fieldKey: 'center',
		fieldSchema: schema.center,
		isSelected: true,
		nodePath,
		propStatus: {status: 'static', codeValue: [0.5, 0.5]},
		schema,
		sourceFrame: 0,
		value: [0.5, 0.5],
	} as unknown as SelectedOutlineUvHandle;

	const controls = getUvEllipseInteractiveControls({
		handles: [handle],
		points,
	});

	expect(controls).toHaveLength(1);
	expect(controls[0].center).toEqual({x: 50, y: 50});
	expect(controls[0].resize[0].axis).toBe('width');
	expect(controls[0].resize[0].position.x).toBeCloseTo(50);
	expect(controls[0].resize[0].position.y).toBeCloseTo(80);
	expect(controls[0].resize[1].axis).toBe('height');
	expect(controls[0].resize[1].position.x).toBeCloseTo(30);
	expect(controls[0].resize[1].position.y).toBeCloseTo(50);
	expect(controls[0].rotationControl?.position.x).toBeCloseTo(22);
	expect(controls[0].rotationControl?.position.y).toBeCloseTo(50);
	expect(controls[0].startControl?.position.x).toBeCloseTo(50);
	expect(controls[0].startControl?.position.y).toBeCloseTo(65);
});

test('UV ellipse interactive controls rotate numeric fields in pixel space', () => {
	const points = [
		{x: 0, y: 0},
		{x: 200, y: 0},
		{x: 200, y: 100},
		{x: 0, y: 100},
	] as const;
	const nodePath = makeKey(['body', 0]);
	const schema = {
		center: {
			type: 'uv-coordinate',
			default: [0.5, 0.5],
			visual: {
				type: 'ellipse',
				width: 'width',
				height: 'height',
				rotation: 'rotation',
				innerScale: 'start',
			},
		},
		width: {
			type: 'number',
			default: 0.6,
			hiddenFromList: false,
		},
		height: {
			type: 'number',
			default: 0.4,
			hiddenFromList: false,
		},
		rotation: {
			type: 'rotation-degrees',
			default: 90,
		},
		start: {
			type: 'number',
			default: 0.5,
			hiddenFromList: false,
		},
	} as const satisfies InteractivitySchema;
	const handle = {
		clientId: 'client-id',
		effectIndex: 0,
		effectValues: {
			center: [0.5, 0.5],
			width: 0.6,
			height: 0.4,
			rotation: 90,
			start: 0.5,
		},
		ellipseControls: {
			width: {
				fieldKey: 'width',
				fieldSchema: schema.width,
				fieldDefault: schema.width.default,
				propStatus: {status: 'static', codeValue: 0.6},
				value: 0.6,
			},
			height: {
				fieldKey: 'height',
				fieldSchema: schema.height,
				fieldDefault: schema.height.default,
				propStatus: {status: 'static', codeValue: 0.4},
				value: 0.4,
			},
			rotation: {
				fieldKey: 'rotation',
				fieldSchema: schema.rotation,
				fieldDefault: schema.rotation.default,
				propStatus: {status: 'static', codeValue: 90},
				value: 90,
			},
			start: {
				fieldKey: 'start',
				fieldSchema: schema.start,
				fieldDefault: schema.start.default,
				propStatus: {status: 'static', codeValue: 0.5},
				value: 0.5,
			},
		},
		fieldDefault: schema.center.default,
		fieldKey: 'center',
		fieldSchema: schema.center,
		isSelected: true,
		nodePath,
		propStatus: {status: 'static', codeValue: [0.5, 0.5]},
		schema,
		sourceFrame: 0,
		value: [0.5, 0.5],
	} as unknown as SelectedOutlineUvHandle;

	const controls = getUvEllipseInteractiveControls({
		dimensions: {width: 200, height: 100},
		handles: [handle],
		points,
	});

	expect(controls).toHaveLength(1);
	expect(controls[0].resize[0].position.x).toBeCloseTo(100);
	expect(controls[0].resize[0].position.y).toBeCloseTo(110);
	expect(controls[0].resize[1].position.x).toBeCloseTo(80);
	expect(controls[0].resize[1].position.y).toBeCloseTo(50);
	expect(controls[0].startControl?.position.x).toBeCloseTo(100);
	expect(controls[0].startControl?.position.y).toBeCloseTo(80);
});

const getUvHandlesForSelectedEffectChild = (selectedFieldKey: string) => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', selectedFieldKey],
	);
	const nodePath = sequenceNodePathInfo.sequenceSubscriptionKey;
	const effectSchema = {
		start: {
			type: 'uv-coordinate',
			default: [0, 0],
			visual: {
				type: 'line',
				to: 'end',
			},
		},
		end: {
			type: 'uv-coordinate',
			default: [1, 1],
		},
		dotSize: {
			type: 'number',
			default: 10,
			hiddenFromList: false,
		},
	} as const satisfies InteractivitySchema;
	const propStatuses: PropStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					effectIndex: 0,
					callee: 'testEffect',
					importPath: null,
					props: {
						start: {
							status: 'static',
							codeValue: [0.2, 0.3],
						},
						end: {
							status: 'static',
							codeValue: [0.8, 0.7],
						},
						dotSize: {
							status: 'static',
							codeValue: 10,
						},
					},
				},
			],
		},
	};

	return getSelectedUvHandles({
		propStatuses,
		clientId: 'client-id',
		getEffectDragOverrides: () => ({}),
		nodePath,
		selectedEffects: getSelectedEffectFieldsBySequenceKey([
			{
				type: 'sequence-effect-prop',
				nodePathInfo: effectPropNodePathInfo,
				i: 0,
				key: selectedFieldKey,
			},
		]).get(getTimelineSequenceSelectionKey(sequenceNodePathInfo)),
		sequence: {
			effects: [{schema: effectSchema}],
		} as unknown as TSequence,
		sourceFrame: 0,
	});
};

test('UV handles include connected coordinates when selecting one coordinate', () => {
	const handles = getUvHandlesForSelectedEffectChild('start');

	expect(
		handles.map((handle) => ({
			fieldKey: handle.fieldKey,
			isSelected: handle.isSelected,
			value: handle.value,
		})),
	).toEqual([
		{fieldKey: 'start', isSelected: true, value: [0.2, 0.3]},
		{fieldKey: 'end', isSelected: false, value: [0.8, 0.7]},
	]);
	expect(
		getUvHandleConnectionLines({
			points: [
				{x: 0, y: 0},
				{x: 100, y: 0},
				{x: 100, y: 100},
				{x: 0, y: 100},
			],
			handles,
		}).map((line) => line.key),
	).toEqual(['0-start-end']);
});

test('UV handles show for selected non-coordinate effect children', () => {
	const handles = getUvHandlesForSelectedEffectChild('dotSize');

	expect(
		handles.map((handle) => ({
			fieldKey: handle.fieldKey,
			isSelected: handle.isSelected,
		})),
	).toEqual([
		{fieldKey: 'start', isSelected: false},
		{fieldKey: 'end', isSelected: false},
	]);
});

test('UV handle selection targets the matching effect property', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);

	expect(
		getSelectedOutlineUvHandleTimelineSelection({
			effectIndex: 1,
			fieldKey: 'end',
			nodePathInfo: sequenceNodePathInfo,
		}),
	).toEqual({
		type: 'sequence-effect-prop',
		nodePathInfo: {
			...sequenceNodePathInfo,
			auxiliaryKeys: ['effects', '1', 'end'],
		},
		i: 1,
		key: 'end',
	});
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
		allFields: false,
		fieldKeys: new Set(['rays']),
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

test('UV handles are requested for selected effect keyframes and easings', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1', 'rays'],
	);
	const sequenceKey = getTimelineSequenceSelectionKey(sequenceNodePathInfo);
	const selectedEffects = getSelectedEffectFieldsBySequenceKey([
		{
			type: 'keyframe',
			nodePathInfo: effectPropNodePathInfo,
			frame: 10,
		},
		{
			type: 'easing',
			nodePathInfo: effectPropNodePathInfo,
			fromFrame: 10,
			toFrame: 20,
			segmentIndex: 0,
		},
	]);

	expect(selectedEffects.get(sequenceKey)?.get(1)).toEqual({
		allFields: false,
		fieldKeys: new Set(['rays']),
	});
});

test('UV handles are requested for keyframed selected effect props', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'position'],
	);
	const nodePath = sequenceNodePathInfo.sequenceSubscriptionKey;
	const effectSchema = {
		position: {
			type: 'uv-coordinate',
			default: [0, 0],
		},
	} as const satisfies InteractivitySchema;
	const propStatuses: PropStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					effectIndex: 0,
					callee: 'testEffect',
					importPath: null,
					props: {
						position: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: [0, 0]},
								{frame: 100, value: [1, 1]},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	};

	const handles = getSelectedUvHandles({
		propStatuses,
		clientId: 'client-id',
		getEffectDragOverrides: () => ({}),
		nodePath,
		selectedEffects: getSelectedEffectFieldsBySequenceKey([
			{
				type: 'sequence-effect-prop',
				nodePathInfo: effectPropNodePathInfo,
				i: 0,
				key: 'position',
			},
		]).get(getTimelineSequenceSelectionKey(sequenceNodePathInfo)),
		sequence: {
			effects: [{schema: effectSchema}],
		} as unknown as TSequence,
		sourceFrame: 50,
	});

	expect(handles).toHaveLength(1);
	expect(handles[0].propStatus.status).toBe('keyframed');
	expect(handles[0].sourceFrame).toBe(50);
	expect(handles[0].value).toEqual([0.5, 0.5]);
});

test('Transform origin easing selection targets the transform origin handle', () => {
	const transformOriginNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'style', 'transformOrigin'],
	);

	expect(
		getSelectedTransformOriginInfo([
			{
				type: 'easing',
				nodePathInfo: transformOriginNodePathInfo,
				fromFrame: 12,
				toFrame: 24,
				segmentIndex: 0,
			},
		]),
	).toEqual({
		sequenceKey: getTimelineSequenceSelectionKey(transformOriginNodePathInfo),
		displayFrame: 12,
	});
});

test('selected sequence keys only include exact sequence selections', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectPropNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '1', 'rays'],
	);
	const sequenceKey = getTimelineSequenceSelectionKey(sequenceNodePathInfo);

	expect(
		getSelectedSequenceKeys([
			{
				type: 'sequence-effect-prop',
				nodePathInfo: effectPropNodePathInfo,
				i: 1,
				key: 'rays',
			},
		]).has(sequenceKey),
	).toBe(false);

	expect(
		getSelectedSequenceKeys([
			{type: 'sequence', nodePathInfo: sequenceNodePathInfo},
		]).has(sequenceKey),
	).toBe(true);
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

test('Derived selectable timeline items follow expanded timeline order', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = sequenceNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 10, value: 0},
						{frame: 20, value: 1},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getSelectableTimelineItems({
			getDragOverrides: () => ({}),
			getEffectDragOverrides: () => ({}),
			getIsExpanded: () => true,
			propStatuses,
			selectedItems: [],
			timeline: [
				{
					depth: 0,
					hash: 'hash',
					keyframeDisplayOffset: 0,
					nodePathInfo: sequenceNodePathInfo,
					sequence: makeTimelineSequence({schema}),
					sequenceFrameOffset: 0,
				},
			],
			timelinePosition: 10,
		}).map(getTimelineSelectionKey),
	).toEqual([
		getTimelineSelectionKey({
			type: 'sequence',
			nodePathInfo: sequenceNodePathInfo,
		}),
		getTimelineSelectionKey({
			type: 'sequence-prop',
			nodePathInfo: opacityNodePathInfo,
			key: 'opacity',
		}),
		getTimelineSelectionKey({
			type: 'easing',
			nodePathInfo: opacityNodePathInfo,
			fromFrame: 10,
			toFrame: 20,
			segmentIndex: 0,
		}),
		getTimelineSelectionKey({
			type: 'keyframe',
			nodePathInfo: opacityNodePathInfo,
			frame: 10,
		}),
		getTimelineSelectionKey({
			type: 'keyframe',
			nodePathInfo: opacityNodePathInfo,
			frame: 20,
		}),
	]);
});

test('Cmd+D duplicates selected timeline sequence and effect rows', () => {
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
		].filter(isDuplicatableEffectSelection),
	).toEqual([
		{
			type: 'sequence-effect',
			nodePathInfo: effectNodePathInfo,
			i: 0,
		},
	]);
});

test('Backspace reset targets multiple selected sequence props', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const rotateNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'style.rotate'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {status: 'static', codeValue: 0.5},
				'style.rotate': {status: 'static', codeValue: '45deg'},
			},
			effects: [],
		},
	} satisfies PropStatuses;

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
		propStatuses,
	});

	expect(resetTargets?.map((target) => target.fieldKey)).toEqual([
		'opacity',
		'style.rotate',
	]);
	expect(resetTargets?.map((target) => target.value)).toEqual([1, '0deg']);
});

test('Backspace reset targets selected keyframed sequence props', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 20, value: 0.5},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: opacityNodePathInfo,
				key: 'opacity',
			},
		],
		sequences: [makeTimelineSequence({schema})],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([
		{
			type: 'sequence-prop',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'opacity',
			value: 1,
			defaultValue: '1',
			schema,
		},
	]);
});

test('Backspace reset skips selected computed sequence props with defaults', () => {
	const schema = {
		'style.scale': {type: 'scale', default: 1, max: 100},
	} satisfies InteractivitySchema;
	const scaleNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'style.scale'],
	);
	const nodePath = scaleNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				'style.scale': {
					status: 'computed',
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: scaleNodePathInfo,
				key: 'style.scale',
			},
		],
		sequences: [makeTimelineSequence({schema})],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([]);
});

test('Backspace reset targets flattened built-in keyframed sequence style props', () => {
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'style.opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				'style.opacity': {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 20, value: 0.5},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: opacityNodePathInfo,
				key: 'style.opacity',
			},
		],
		sequences: [
			makeTimelineSequence({schema: NoReactInternals.sequenceSchema}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([
		{
			type: 'sequence-prop',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.opacity',
			value: 1,
			defaultValue: '1',
			schema: NoReactInternals.sequenceSchema,
		},
	]);
});

test('Backspace reset skips keyframed sequence props without defaults', () => {
	const schema = {
		opacity: {type: 'number', default: undefined, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 20, value: 0.5},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: opacityNodePathInfo,
				key: 'opacity',
			},
		],
		sequences: [makeTimelineSequence({schema})],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([]);
});

test('Selected outline dragging applies the same delta to all selected sequences', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const firstNodePath = makeKey(['body', 0]);
	const secondNodePath = makeKey(['body', 1]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(firstNodePath),
			sourceFrame: 12,
			startX: 10,
			startY: 20,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '10px 20px'},
				fieldDefault: '0px 0px',
				keyframeDisplayOffset: 30,
				nodePath: firstNodePath,
				schema,
			},
		},
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(secondNodePath),
			sourceFrame: 12,
			startX: -5,
			startY: 3,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '-5px 3px'},
				fieldDefault: '0px 0px',
				keyframeDisplayOffset: 30,
				nodePath: secondNodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineDragState[];

	const lastValues = getSelectedOutlineDragValues({
		dragStates,
		deltaX: 7.333333,
		deltaY: -4.666667,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('17.3px 15.3px');
	expect(lastValues.get(dragStates[1].key)).toBe('2.3px -1.7px');
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: firstNodePath,
			fieldKey: 'style.translate',
			value: '17.3px 15.3px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: secondNodePath,
			fieldKey: 'style.translate',
			value: '2.3px -1.7px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);
});

test('Selected outline active schema exposes default Sequence translate controls', () => {
	const activeSchema = getSelectedOutlineActiveSchema({
		schema: NoReactInternals.sequenceSchema,
		currentRuntimeValueDotNotation: {
			layout: undefined,
			'style.translate': undefined,
		},
		dragOverrides: {},
		propStatus: {
			layout: {status: 'static', codeValue: undefined},
			'style.translate': {status: 'static', codeValue: undefined},
		},
		frame: 0,
	});

	const translateField = activeSchema['style.translate'];
	expect(translateField?.type).toBe('translate');
	if (translateField?.type !== 'translate') {
		throw new Error('Expected style.translate to be active');
	}

	expect(translateField.default).toBe('0px 0px');
});

test('Selected outline dragging can lock movement to the dominant axis', () => {
	expect(
		applySelectedOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 7,
			axisLocked: true,
		}),
	).toEqual({deltaX: 12, deltaY: 0});
	expect(
		applySelectedOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 13,
			axisLocked: true,
		}),
	).toEqual({deltaX: 0, deltaY: 13});
	expect(
		applySelectedOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 13,
			axisLocked: false,
		}),
	).toEqual({deltaX: 12, deltaY: 13});
});

test('Selected outline keyboard nudging moves by one or ten pixels', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 12,
			startX: 10,
			startY: 20,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '10px 20px'},
				fieldDefault: '0px 0px',
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineDragState[];

	expect(
		getSelectedOutlineKeyboardNudgeDelta({
			direction: 'left',
			shiftKey: false,
		}),
	).toBe(-1);
	expect(
		getSelectedOutlineKeyboardNudgeDelta({
			direction: 'right',
			shiftKey: true,
		}),
	).toBe(10);
	expect(
		getSelectedOutlineKeyboardNudgeDelta({
			direction: 'up',
			shiftKey: false,
		}),
	).toBe(-1);
	expect(
		getSelectedOutlineKeyboardNudgeDelta({
			direction: 'down',
			shiftKey: true,
		}),
	).toBe(10);
	const accumulatedDeltas = [
		{direction: 'right', shiftKey: false},
		{direction: 'right', shiftKey: false},
		{direction: 'down', shiftKey: true},
	] satisfies readonly {
		readonly direction: 'left' | 'right' | 'up' | 'down';
		readonly shiftKey: boolean;
	}[];
	const finalDeltas = accumulatedDeltas.reduce(
		(deltas, keyPress) =>
			getSelectedOutlineKeyboardNudgeDeltas({
				...deltas,
				direction: keyPress.direction,
				shiftKey: keyPress.shiftKey,
			}),
		{deltaX: 0, deltaY: 0},
	);

	expect(finalDeltas).toEqual({deltaX: 2, deltaY: 10});

	const horizontalLastValues = getSelectedOutlineDragValues({
		dragStates,
		deltaX: getSelectedOutlineKeyboardNudgeDelta({
			direction: 'right',
			shiftKey: true,
		}),
		deltaY: 0,
	});

	expect(horizontalLastValues.get(dragStates[0].key)).toBe('20px 20px');
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues: horizontalLastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			value: '20px 20px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);

	const verticalLastValues = getSelectedOutlineDragValues({
		dragStates,
		deltaX: 0,
		deltaY: getSelectedOutlineKeyboardNudgeDelta({
			direction: 'down',
			shiftKey: true,
		}),
	});

	expect(verticalLastValues.get(dragStates[0].key)).toBe('10px 30px');
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues: verticalLastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			value: '10px 30px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);
});

test('Selected outline dragging starts after a screen pixel threshold', () => {
	expect(
		isSelectedOutlineDragPastThreshold({
			deltaX: selectedOutlineDragThresholdPx - 0.1,
			deltaY: 0,
		}),
	).toBe(false);
	expect(
		isSelectedOutlineDragPastThreshold({
			deltaX: selectedOutlineDragThresholdPx,
			deltaY: 0,
		}),
	).toBe(true);
	expect(
		isSelectedOutlineDragPastThreshold({
			deltaX: 3,
			deltaY: 3,
		}),
	).toBe(true);
});

test('Selected outline dragging keyframed translate adds a keyframe at the source frame', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 20,
			startX: 50,
			startY: 25,
			target: {
				clientId: 'client',
				propStatus: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: '0px 0px'},
						{frame: 40, value: '100px 50px'},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
				fieldDefault: '0px 0px',
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineDragState[];

	const lastValues = getSelectedOutlineDragValues({
		dragStates,
		deltaX: 7,
		deltaY: -4,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('57px 21px');
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'keyframed',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			sourceFrame: 20,
			value: '57px 21px',
			schema,
			clientId: 'client',
		},
	]);
	expect(
		getSelectedOutlineDragChanges({
			dragStates,
			lastValues: new Map([[dragStates[0].key, '50px 25px']]),
		}),
	).toEqual([]);
});

test('Selected outline edge dragging scales one axis when scale is unlinked', () => {
	const schema = {
		'style.scale': {type: 'scale', default: 1, max: 100},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify(1),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 0,
			startX: 2,
			startY: 3,
			startZ: 1,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '2 3'},
				fieldDefault: 1,
				fieldSchema: schema['style.scale'],
				keyframeDisplayOffset: 0,
				linked: false,
				nodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineScaleDragState[];

	const lastValues = getSelectedOutlineScaleDragValues({
		dragStates,
		axis: 'x',
		scaleFactor: 1.25,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('2.5 3');
	expect(
		getSelectedOutlineScaleDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.scale',
			value: '2.5 3',
			defaultValue: JSON.stringify(1),
			schema,
		},
	]);

	const negativeValues = getSelectedOutlineScaleDragValues({
		dragStates,
		axis: 'x',
		scaleFactor: -0.5,
	});

	expect(negativeValues.get(dragStates[0].key)).toBe('-1 3');
});

test('Selected outline edge dragging rounds scale values', () => {
	const schema = {
		'style.scale': {type: 'scale', default: 1, max: 100},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify(1),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 0,
			startX: 2,
			startY: 3,
			startZ: 1,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '2 3'},
				fieldDefault: 1,
				fieldSchema: schema['style.scale'],
				keyframeDisplayOffset: 0,
				linked: false,
				nodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineScaleDragState[];

	const lastValues = getSelectedOutlineScaleDragValues({
		dragStates,
		axis: 'x',
		scaleFactor: 1 / 3,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('0.667 3');
});

test('Selected outline edge dragging preserves aspect ratio when scale is linked', () => {
	const schema = {
		'style.scale': {type: 'scale', default: 1, max: 100},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify(1),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 0,
			startX: 2,
			startY: 3,
			startZ: 1,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '2 3'},
				fieldDefault: 1,
				fieldSchema: schema['style.scale'],
				keyframeDisplayOffset: 0,
				linked: true,
				nodePath,
				schema,
			},
		},
	] satisfies SelectedOutlineScaleDragState[];

	const lastValues = getSelectedOutlineScaleDragValues({
		dragStates,
		axis: 'x',
		scaleFactor: 1.25,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('2.5 3.75');
});

test('Selected outline corner dragging rotates selected sequences', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const firstNodePath = makeKey(['body', 0]);
	const secondNodePath = makeKey(['body', 1]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(firstNodePath),
			sourceFrame: 12,
			startDegrees: 45,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '45deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath: firstNodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(secondNodePath),
			sourceFrame: 12,
			startDegrees: -10,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '-10deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath: secondNodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
	] satisfies SelectedOutlineRotationDragState[];

	const lastValues = getSelectedOutlineRotationDragValues({
		dragStates,
		rotationDeltaDegrees: 90,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('135deg');
	expect(lastValues.get(dragStates[1].key)).toBe('80deg');
	expect(
		getSelectedOutlineRotationDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: firstNodePath,
			fieldKey: 'style.rotate',
			value: '135deg',
			defaultValue: JSON.stringify('0deg'),
			schema,
		},
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: secondNodePath,
			fieldKey: 'style.rotate',
			value: '80deg',
			defaultValue: JSON.stringify('0deg'),
			schema,
		},
	]);
});

test('Selected outline corner dragging rounds rotation values', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 12,
			startDegrees: 32,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '32deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
	] satisfies SelectedOutlineRotationDragState[];

	const lastValues = getSelectedOutlineRotationDragValues({
		dragStates,
		rotationDeltaDegrees: 0.480832,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('32.5deg');
});

test('Selected outline corner dragging snaps rotation to 15 degree increments', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 12,
			startDegrees: 32,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '32deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
	] satisfies SelectedOutlineRotationDragState[];

	const rotationDeltaDegrees = snapSelectedOutlineRotationDeltaDegrees({
		dragStates,
		rotationDeltaDegrees: 8,
	});
	const lastValues = getSelectedOutlineRotationDragValues({
		dragStates,
		rotationDeltaDegrees,
	});

	expect(rotationDeltaDegrees).toBe(13);
	expect(lastValues.get(dragStates[0].key)).toBe('45deg');
});

test('Selected outline corner dragging snaps selected rotations from the first drag state', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const firstNodePath = makeKey(['body', 0]);
	const secondNodePath = makeKey(['body', 1]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(firstNodePath),
			sourceFrame: 12,
			startDegrees: 32,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '32deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath: firstNodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(secondNodePath),
			sourceFrame: 12,
			startDegrees: -10,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '-10deg'},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath: secondNodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
	] satisfies SelectedOutlineRotationDragState[];

	const rotationDeltaDegrees = snapSelectedOutlineRotationDeltaDegrees({
		dragStates,
		rotationDeltaDegrees: 8,
	});
	const lastValues = getSelectedOutlineRotationDragValues({
		dragStates,
		rotationDeltaDegrees,
	});

	expect(rotationDeltaDegrees).toBe(13);
	expect(lastValues.get(dragStates[0].key)).toBe('45deg');
	expect(lastValues.get(dragStates[1].key)).toBe('3deg');
});

test('Selected outline corner dragging keyframed rotation adds a keyframe at the source frame', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0deg'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 20,
			startDegrees: 45,
			target: {
				clientId: 'client',
				propStatus: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: '0deg'},
						{frame: 40, value: '90deg'},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
				transformOriginValue: '50% 50%',
			},
		},
	] satisfies SelectedOutlineRotationDragState[];

	const lastValues = getSelectedOutlineRotationDragValues({
		dragStates,
		rotationDeltaDegrees: 15,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('60deg');
	expect(
		getSelectedOutlineRotationDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'keyframed',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.rotate',
			sourceFrame: 20,
			value: '60deg',
			schema,
			clientId: 'client',
		},
	]);
	expect(
		getSelectedOutlineRotationDragChanges({
			dragStates,
			lastValues: new Map([[dragStates[0].key, '45deg']]),
		}),
	).toEqual([]);
});

test('Selected outline rotation delta does not jump at the angle wrap-around', () => {
	const firstStep = getSelectedOutlineRotationDeltaDegrees({
		from: 170,
		to: 175,
	});
	const secondStep = getSelectedOutlineRotationDeltaDegrees({
		from: 175,
		to: -170,
	});

	expect(firstStep + secondStep).toBe(20);
});

test('Selected outline rotation corners use the outline corners and center', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 50},
		{x: 0, y: 50},
	] as const;
	const topRight = getSelectedOutlineRotationCornerInfo(points, 'top-right');

	expect(topRight.point).toEqual({x: 100, y: 0});
	expect(topRight.center).toEqual({x: 50, y: 25});
	expect(topRight.cursor).toContain('data:image/svg+xml');
	expect(decodeURIComponent(topRight.cursor)).toContain(
		'<svg width="24" height="24"',
	);
	expect(topRight.cursor).toContain('") 12 12, alias');
});

test('Selected outline rotation pivot follows transform origin', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 50},
		{x: 0, y: 50},
	] as const;
	const dimensions = {width: 100, height: 50};

	expect(
		getSelectedOutlineRotationPivot({
			dimensions,
			points,
			transformOriginValue: 'center',
		}),
	).toEqual({x: 50, y: 25});
	expect(
		getSelectedOutlineRotationPivot({
			dimensions,
			points,
			transformOriginValue: 'left bottom',
		}),
	).toEqual({x: 0, y: 50});
	expect(
		getSelectedOutlineRotationPivot({
			dimensions,
			points,
			transformOriginValue: '25px top',
		}),
	).toEqual({x: 25, y: 0});
	expect(
		getSelectedOutlineRotationPivot({
			dimensions,
			points,
			transformOriginValue: 'calc(50% + 1px) center',
		}),
	).toEqual({x: 50, y: 25});
	expect(
		getSelectedOutlineRotationPivot({
			dimensions: null,
			points,
			transformOriginValue: 'left top',
		}),
	).toEqual({x: 50, y: 25});
});

test('Selected outline rotation cursors use the outline rotation', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 100},
		{x: 0, y: 100},
	] as const;

	expect(
		getSelectedOutlineRotationCornerInfo(points, 'top-left').cursorDegrees,
	).toBe(270);
	expect(
		getSelectedOutlineRotationCornerInfo(points, 'top-right').cursorDegrees,
	).toBe(0);
	expect(
		getSelectedOutlineRotationCornerInfo(points, 'bottom-right').cursorDegrees,
	).toBe(90);
	expect(
		getSelectedOutlineRotationCornerInfo(points, 'bottom-left').cursorDegrees,
	).toBe(180);
});

test('Selected outline rotation cursor angle is independent from aspect ratio', () => {
	const points = [
		{x: 0, y: 0},
		{x: 160, y: 0},
		{x: 160, y: 90},
		{x: 0, y: 90},
	] as const;

	expect(
		getSelectedOutlineRotationCornerInfo(points, 'top-right').cursorDegrees,
	).toBe(0);
	expect(
		getSelectedOutlineRotationCornerInfo(points, 'bottom-left').cursorDegrees,
	).toBe(180);
});

test('Selected outline scale edges project pointer movement onto the edge normal', () => {
	const points = [
		{x: 0, y: 0},
		{x: 100, y: 0},
		{x: 100, y: 50},
		{x: 0, y: 50},
	] as const;
	const right = getSelectedOutlineScaleEdgeInfo(points, 'right');
	const top = getSelectedOutlineScaleEdgeInfo(points, 'top');

	expect(right?.axis).toBe('x');
	expect(right?.cursor).toBe('ew-resize');
	expect(right?.extent).toBe(100);
	expect(right?.normal).toEqual({x: 1, y: 0});
	expect(top?.axis).toBe('y');
	expect(top?.cursor).toBe('ns-resize');
	expect(top?.extent).toBe(50);
	expect(top?.normal).toEqual({x: 0, y: -1});
});

test('Selected outline scale edge cursors follow rotated outlines', () => {
	const rotated90Degrees = [
		{x: 0, y: 0},
		{x: 0, y: 100},
		{x: -50, y: 100},
		{x: -50, y: 0},
	] as const;
	const rotated45Degrees = [
		{x: 0, y: 0},
		{x: 100, y: 100},
		{x: 50, y: 150},
		{x: -50, y: 50},
	] as const;

	expect(
		getSelectedOutlineScaleEdgeInfo(rotated90Degrees, 'right')?.cursor,
	).toBe('ns-resize');
	expect(getSelectedOutlineScaleEdgeInfo(rotated90Degrees, 'top')?.cursor).toBe(
		'ew-resize',
	);
	expect(
		getSelectedOutlineScaleEdgeInfo(rotated45Degrees, 'right')?.cursor,
	).toBe('nwse-resize');
	expect(getSelectedOutlineScaleEdgeInfo(rotated45Degrees, 'top')?.cursor).toBe(
		'nesw-resize',
	);
});

test('Backspace reset targets selected effect props', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
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
						intensity: {status: 'static', codeValue: 10},
					},
				},
			],
		},
	} satisfies PropStatuses;

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
		propStatuses,
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

test('Backspace reset targets active enum variant effect props', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		colorMode: {
			type: 'enum',
			default: 'solid' as const,
			variants: {
				solid: {
					dotColor: {
						type: 'color',
						default: 'red',
					},
				},
				source: {},
			},
		},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'dotColor'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
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
						colorMode: {status: 'static', codeValue: 'solid'},
						dotColor: {status: 'static', codeValue: 'blue'},
					},
				},
			],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-effect-prop',
				nodePathInfo,
				i: 0,
				key: 'dotColor',
			},
		],
		sequences: [
			makeTimelineSequence({
				schema,
				effects: [{schema: effectSchema}],
			}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([
		{
			type: 'effect-prop',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			effectIndex: 0,
			fieldKey: 'dotColor',
			value: 'red',
			defaultValue: '"red"',
			schema: effectSchema,
		},
	]);
});

test('Backspace reset targets selected static blur radius with default', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		radius: {type: 'number', default: 40, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'radius'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {},
			effects: [
				{
					canUpdate: true,
					callee: 'blur',
					importPath: null,
					effectIndex: 0,
					props: {
						radius: {status: 'static', codeValue: 24},
					},
				},
			],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-effect-prop',
				nodePathInfo,
				i: 0,
				key: 'radius',
			},
		],
		sequences: [
			makeTimelineSequence({
				schema,
				effects: [{schema: effectSchema}],
			}),
		],
		overrideIdsToNodePaths: {override: nodePath},
		propStatuses,
	});

	expect(resetTargets).toEqual([
		{
			type: 'effect-prop',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			effectIndex: 0,
			fieldKey: 'radius',
			value: 40,
			defaultValue: '40',
			schema: effectSchema,
		},
	]);
});

test('Backspace reset targets selected keyframed effect props', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
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
						intensity: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 10},
								{frame: 20, value: 20},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	} satisfies PropStatuses;

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
		propStatuses,
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

test('Backspace reset skips keyframed effect props without defaults', () => {
	const schema = {} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: undefined, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const nodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
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
						intensity: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 10},
								{frame: 20, value: 20},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
							output: undefined,
						},
					},
				},
			],
		},
	} satisfies PropStatuses;

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
		propStatuses,
	});

	expect(resetTargets).toEqual([]);
});

test('Backspace reset targets mixed selected sequence and effect props', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const intensityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['effects', '0', 'intensity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {status: 'static', codeValue: 0.5},
			},
			effects: [
				{
					canUpdate: true,
					callee: 'effect',
					importPath: null,
					effectIndex: 0,
					props: {
						intensity: {status: 'static', codeValue: 10},
					},
				},
			],
		},
	} satisfies PropStatuses;

	const resetTargets = getTimelinePropResetTargets({
		selections: [
			{
				type: 'sequence-prop',
				nodePathInfo: opacityNodePathInfo,
				key: 'opacity',
			},
			{
				type: 'sequence-effect-prop',
				nodePathInfo: intensityNodePathInfo,
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
		propStatuses,
	});

	expect(resetTargets?.map((target) => target.type)).toEqual([
		'sequence-prop',
		'effect-prop',
	]);
	expect(resetTargets?.map((target) => target.fieldKey)).toEqual([
		'opacity',
		'intensity',
	]);
	expect(resetTargets?.map((target) => target.value)).toEqual([1, 0]);
});

test('Backspace reset ignores incompatible mixed prop selections', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);

	expect(
		getTimelinePropResetTargets({
			selections: [
				{
					type: 'sequence-prop',
					nodePathInfo: opacityNodePathInfo,
					key: 'opacity',
				},
				{
					type: 'keyframe',
					nodePathInfo: opacityNodePathInfo,
					frame: 12,
				},
			],
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {
				override: opacityNodePathInfo.sequenceSubscriptionKey,
			},
			propStatuses: makeDurationPropStatuses([
				opacityNodePathInfo.sequenceSubscriptionKey,
			]),
		}),
	).toBe(null);
});

test('Deleting unsupported mixed timeline selection types returns null', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);
	const effectNodePathInfo = makeNodePathInfo(['body', 1], ['effects', '0']);
	const confirm = () => Promise.resolve(true);

	expect(
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
			setPropStatuses: () => undefined,
			clientId: 'client',
			confirm,
		}),
	).toBe(null);
});

test('Deleting selected effects keeps their parent sequence selected', () => {
	const effectNodePathInfo = makeNodePathInfo(['body', 0], ['effects', '1']);
	const result = getTimelineSelectionAfterDeletingItems({
		selections: [
			{
				type: 'sequence-effect',
				nodePathInfo: effectNodePathInfo,
				i: 1,
			},
		],
	});

	expect(result).toEqual([
		{
			type: 'sequence',
			nodePathInfo: {
				...effectNodePathInfo,
				auxiliaryKeys: [],
			},
		},
	]);
});

test('Deleting selected all-effects rows keeps their parent sequence selected', () => {
	const effectsNodePathInfo = makeNodePathInfo(['body', 0], ['effects']);
	const result = getTimelineSelectionAfterDeletingItems({
		selections: [
			{
				type: 'sequence-all-effects',
				nodePathInfo: effectsNodePathInfo,
			},
		],
	});

	expect(result).toEqual([
		{
			type: 'sequence',
			nodePathInfo: {
				...effectsNodePathInfo,
				auxiliaryKeys: [],
			},
		},
	]);
});

test('Deleting selected sequences still clears selection', () => {
	const sequenceNodePathInfo = makeNodePathInfo(['body', 0], []);

	expect(
		getTimelineSelectionAfterDeletingItems({
			selections: [{type: 'sequence', nodePathInfo: sequenceNodePathInfo}],
		}),
	).toEqual([]);
});

test('Deleting selected keyframe selects remaining easing under playhead', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 10, value: 0.5},
						{frame: 20, value: 1},
					],
					easing: [{type: 'linear'}, {type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getTimelineSelectionAfterDeletingItems({
			selections: [
				{
					type: 'keyframe',
					nodePathInfo: opacityNodePathInfo,
					frame: 10,
				},
			],
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
			timelinePosition: 10,
		}),
	).toEqual([
		{
			type: 'easing',
			nodePathInfo: opacityNodePathInfo,
			fromFrame: 0,
			toFrame: 20,
			segmentIndex: 0,
		},
	]);
});

test('Deleting selected keyframe clears selection when playhead is not between remaining keyframes', () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
			canUpdate: true,
			props: {
				opacity: {
					status: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0},
						{frame: 10, value: 0.5},
						{frame: 20, value: 1},
					],
					easing: [{type: 'linear'}, {type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
			},
			effects: [],
		},
	} satisfies PropStatuses;

	expect(
		getTimelineSelectionAfterDeletingItems({
			selections: [
				{
					type: 'keyframe',
					nodePathInfo: opacityNodePathInfo,
					frame: 0,
				},
			],
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			propStatuses,
			timelinePosition: 0,
		}),
	).toEqual([]);
});

test('Deleting selected keyframes ignores selected easings', async () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const opacityNodePathInfo = makeNodePathInfo(
		['body', 0],
		['controls', 'opacity'],
	);
	const nodePath = opacityNodePathInfo.sequenceSubscriptionKey;
	const fetchCalls: unknown[] = [];
	const previousFetch = globalThis.fetch;
	globalThis.fetch = ((input, init) => {
		fetchCalls.push({
			input,
			body:
				typeof init?.body === 'string'
					? JSON.parse(init.body)
					: (init?.body ?? null),
		});

		return Promise.resolve({
			json: () => Promise.resolve({success: true, data: {}}),
		} as Response);
	}) as typeof fetch;

	try {
		const result = await deleteSelectedTimelineItems({
			selections: [
				{
					type: 'keyframe',
					nodePathInfo: opacityNodePathInfo,
					frame: 12,
				},
				{
					type: 'easing',
					nodePathInfo: opacityNodePathInfo,
					fromFrame: 12,
					toFrame: 24,
					segmentIndex: 0,
				},
			],
			sequences: [makeTimelineSequence({schema})],
			overrideIdsToNodePaths: {override: nodePath},
			setPropStatuses: () => undefined,
			clientId: 'client',
			confirm: () => Promise.resolve(true),
		});

		expect(result).toBe(true);
		expect(fetchCalls).toEqual([
			{
				input: '/api/delete-keyframes',
				body: {
					sequenceKeyframes: [
						{
							fileName: '/project/src/Comp.tsx',
							nodePath,
							key: 'opacity',
							frame: 12,
							schema,
						},
					],
					effectKeyframes: [],
					clientId: 'client',
				},
			},
		]);
	} finally {
		globalThis.fetch = previousFetch;
	}
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

test('Cmd/Ctrl+click mixes compatible prop row selections', () => {
	const sequenceProp = {
		type: 'sequence-prop' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		key: 'opacity',
	};
	const effectProp = {
		type: 'sequence-effect-prop' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['effects', '0', 'intensity']),
		i: 0,
		key: 'intensity',
	};
	const allSelectableItems = [sequenceProp, effectProp];

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [sequenceProp],
				anchor: sequenceProp,
			},
			clickedItem: effectProp,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [sequenceProp, effectProp],
		anchor: effectProp,
	});

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [sequenceProp, effectProp],
				anchor: effectProp,
			},
			clickedItem: effectProp,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [sequenceProp],
		anchor: effectProp,
	});
});

test('Cmd/Ctrl+click mixes compatible keyframe and easing selections', () => {
	const keyframe = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		frame: 10,
	};
	const easing = {
		type: 'easing' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		fromFrame: 10,
		toFrame: 20,
		segmentIndex: 0,
	};

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [keyframe],
				anchor: keyframe,
			},
			clickedItem: easing,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems: [keyframe, easing],
		}),
	).toEqual({
		selectedItems: [keyframe, easing],
		anchor: easing,
	});
});

test('Cmd/Ctrl+click replaces incompatible mixed selections', () => {
	const sequenceProp = {
		type: 'sequence-prop' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		key: 'opacity',
	};
	const keyframe = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		frame: 10,
	};

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [sequenceProp],
				anchor: sequenceProp,
			},
			clickedItem: keyframe,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems: [sequenceProp, keyframe],
		}),
	).toEqual({
		selectedItems: [keyframe],
		anchor: keyframe,
	});
});

test('Guide selections are single selections and incompatible with timeline items', () => {
	const guideA = {type: 'guide' as const, guideId: 'guide-a'};
	const guideB = {type: 'guide' as const, guideId: 'guide-b'};
	const rowA = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
	};

	expect(getTimelineSelectionKey(guideA)).toBe('guide.guide-a');
	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [rowA],
				anchor: rowA,
			},
			clickedItem: guideA,
			interaction: {shiftKey: false, toggleKey: true},
			allSelectableItems: [rowA, guideA, guideB],
		}),
	).toEqual({
		selectedItems: [guideA],
		anchor: guideA,
	});
	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [guideA],
				anchor: guideA,
			},
			clickedItem: guideB,
			interaction: {shiftKey: true, toggleKey: false},
			allSelectableItems: [rowA, guideA, guideB],
		}),
	).toEqual({
		selectedItems: [guideB],
		anchor: guideB,
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

test('Shift+click can select an inspector effect range', () => {
	const effectA = makeNodePathInfo(['body', 0], ['effects', '0']);
	const effectB = makeNodePathInfo(['body', 0], ['effects', '1']);
	const effectC = makeNodePathInfo(['body', 0], ['effects', '2']);
	const allSelectableItems = getInspectorSelectableItems(
		[effectA, effectB, effectC].map((nodePathInfo) => ({
			depth: 0,
			node: {
				kind: 'group' as const,
				nodePathInfo,
				label: 'Effect',
				effectInfo: {
					documentationLink: null,
					effectIndex: Number(nodePathInfo.auxiliaryKeys[1]),
					effectSchema: {},
				},
				children: [],
			},
		})),
	);

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [{type: 'sequence-effect', nodePathInfo: effectA, i: 0}],
				anchor: {type: 'sequence-effect', nodePathInfo: effectA, i: 0},
			},
			clickedItem: {type: 'sequence-effect', nodePathInfo: effectC, i: 2},
			interaction: {shiftKey: true, toggleKey: false},
			allSelectableItems,
		}),
	).toEqual({
		selectedItems: [
			{type: 'sequence-effect', nodePathInfo: effectA, i: 0},
			{type: 'sequence-effect', nodePathInfo: effectB, i: 1},
			{type: 'sequence-effect', nodePathInfo: effectC, i: 2},
		],
		anchor: {type: 'sequence-effect', nodePathInfo: effectA, i: 0},
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

test('Selecting an easing segment replaces keyframe selection with the new type', () => {
	const keyframe = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
		frame: 10,
	};
	const easing = {
		type: 'easing' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
		fromFrame: 10,
		toFrame: 20,
		segmentIndex: 0,
	};

	expect(
		getTimelineSelectionAfterInteraction({
			currentState: {
				selectedItems: [keyframe],
				anchor: keyframe,
			},
			clickedItem: easing,
			interaction: {shiftKey: false, toggleKey: false},
			allSelectableItems: [keyframe, easing],
		}),
	).toEqual({
		selectedItems: [easing],
		anchor: easing,
	});
});

test('Dragging an easing segment drags selected keyframes', () => {
	const selectedKeyframeA = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		frame: 10,
	};
	const selectedKeyframeB = {
		type: 'keyframe' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		frame: 30,
	};
	const easing = {
		type: 'easing' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		fromFrame: 10,
		toFrame: 20,
		segmentIndex: 0,
	};

	expect(
		getKeyframesForTimelineEasingDrag({
			currentSelections: [selectedKeyframeA, selectedKeyframeB],
			interaction: {shiftKey: false, toggleKey: false},
			selectionItem: easing,
			selected: false,
		}),
	).toEqual([selectedKeyframeA, selectedKeyframeB]);
});

test('Dragging only selected easing segments drags connected keyframes', () => {
	const easingA = {
		type: 'easing' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		fromFrame: 10,
		toFrame: 20,
		segmentIndex: 0,
	};
	const easingB = {
		type: 'easing' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], ['controls', 'opacity']),
		fromFrame: 20,
		toFrame: 30,
		segmentIndex: 1,
	};

	expect(
		getKeyframesForTimelineEasingDrag({
			currentSelections: [easingA, easingB],
			interaction: {shiftKey: false, toggleKey: false},
			selectionItem: easingA,
			selected: true,
		}),
	).toEqual([
		{
			type: 'keyframe',
			nodePathInfo: easingA.nodePathInfo,
			frame: 10,
		},
		{
			type: 'keyframe',
			nodePathInfo: easingA.nodePathInfo,
			frame: 20,
		},
		{
			type: 'keyframe',
			nodePathInfo: easingB.nodePathInfo,
			frame: 30,
		},
	]);
});

test('Easing selection keys follow segment identity while frames move', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);

	expect(
		getTimelineSelectionKey({
			type: 'easing',
			nodePathInfo,
			fromFrame: 10,
			toFrame: 20,
			segmentIndex: 0,
		}),
	).toBe(
		getTimelineSelectionKey({
			type: 'easing',
			nodePathInfo,
			fromFrame: 15,
			toFrame: 25,
			segmentIndex: 0,
		}),
	);
});

test('Easing keyframe drag preserves selected item types at moved frames', () => {
	const nodePathInfo = makeNodePathInfo(['body', 0], ['controls', 'opacity']);
	const selectedKeyframe = {
		type: 'keyframe' as const,
		nodePathInfo,
		frame: 10,
	};
	const selectedEasing = {
		type: 'easing' as const,
		nodePathInfo,
		fromFrame: 10,
		toFrame: 20,
		segmentIndex: 0,
	};

	expect(
		getTimelineSelectionsAfterEasingKeyframeDrag({
			delta: 5,
			selections: [selectedKeyframe, selectedEasing],
			targets: [
				{nodePathInfo, frame: 10},
				{nodePathInfo, frame: 20},
			],
		}),
	).toEqual([
		{
			...selectedKeyframe,
			frame: 15,
		},
		{
			...selectedEasing,
			fromFrame: 15,
			toFrame: 25,
		},
	]);
});

test('Unavailable timeline selections are removed from the active selection state', () => {
	const availableRow = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], []),
	};
	const unavailableRow = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 1], []),
	};

	expect(
		getAvailableTimelineSelectionState({
			availableKeys: new Set([getTimelineSelectionKey(availableRow)]),
			state: {
				selectedItems: [availableRow, unavailableRow],
				anchor: unavailableRow,
			},
		}),
	).toEqual({
		selectedItems: [availableRow],
		anchor: null,
	});
});

test('Available timeline selections are refreshed with the latest selectable item', () => {
	const staleRow = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], [], true, [['oldEffect']]),
	};
	const currentRow = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 0], [], true, [
			['oldEffect'],
			['newEffect'],
		]),
	};
	const currentRowKey = getTimelineSelectionKey(currentRow);

	const result = getAvailableTimelineSelectionState({
		availableKeys: new Set([currentRowKey]),
		availableItemsByKey: new Map([[currentRowKey, currentRow]]),
		state: {
			selectedItems: [staleRow],
			anchor: staleRow,
		},
	});

	expect(result.selectedItems[0]).toBe(currentRow);
	expect(result.anchor).toBe(currentRow);
});

test('Unavailable timeline selections become no active selection', () => {
	const unavailableRow = {
		type: 'sequence' as const,
		nodePathInfo: makeNodePathInfo(['body', 1], []),
	};

	expect(
		getAvailableTimelineSelectionState({
			availableKeys: new Set(),
			state: {
				selectedItems: [unavailableRow],
				anchor: unavailableRow,
			},
		}),
	).toEqual({
		selectedItems: [],
		anchor: null,
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

test('Selected timeline rows do not reselect on pointer down without modifiers', () => {
	expect(
		shouldSelectTimelineRowOnPointerDown({
			selected: true,
			shiftKey: false,
			metaKey: false,
			ctrlKey: false,
		}),
	).toBe(false);
	expect(
		shouldSelectTimelineRowOnPointerDown({
			selected: false,
			shiftKey: false,
			metaKey: false,
			ctrlKey: false,
		}),
	).toBe(true);
	expect(
		shouldSelectTimelineRowOnPointerDown({
			selected: true,
			shiftKey: false,
			metaKey: true,
			ctrlKey: false,
		}),
	).toBe(true);
});
