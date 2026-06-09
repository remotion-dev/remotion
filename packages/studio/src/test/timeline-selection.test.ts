import {expect, test} from 'bun:test';
import type {RefObject} from 'react';
import {
	Internals,
	type PropStatuses,
	type SequenceNodePath,
	type SequencePropsSubscriptionKey,
	type SequenceSchema,
	type TSequence,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	constrainUv,
	getSelectedUvHandles,
	getUvCoordinateForPoint,
	getUvHandleConnectionLines,
	getUvHandlePosition,
} from '../components/selected-outline-uv';
import {
	applySelectedOutlineDragAxisLock,
	getOutlineSelectionInteraction,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragValues,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	getSelectedSequenceKeys,
	getSequencesWithSelectableOutlines,
	type SelectedOutlineDragState,
	type SelectedOutlineRotationDragState,
	type SelectedOutlineScaleDragState,
} from '../components/SelectedOutlineOverlay';
import {deleteSelectedTimelineItems} from '../components/Timeline/delete-selected-timeline-item';
import {isDuplicatableSequenceRowSelection} from '../components/Timeline/duplicate-selected-timeline-item';
import {getTimelinePropResetTargets} from '../components/Timeline/reset-selected-timeline-props';
import {
	getEffectPropClipboardDataFromSelection,
	getPasteEffectPropTarget,
	getPasteEffectsTarget,
	getSnapshotsFromSelection,
	type PasteEffectPropTarget,
	type PasteEffectsTarget,
} from '../components/Timeline/TimelineClipboardKeybindings';
import {getSelectedKeyframeControlNodePathInfos} from '../components/Timeline/TimelineKeyframeControls';
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
import {
	getTimelineSequenceDurationDragChanges,
	getTimelineSequenceDurationDragTargets,
	getTimelineSequenceDurationDragValue,
	getTimelineSequenceFromDragChanges,
	getTimelineSequenceFromDragTargets,
	getTimelineSequenceFromDragValue,
} from '../components/Timeline/TimelineSequenceRightEdgeDragHandle';
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
	type = 'sequence',
}: {
	readonly schema: SequenceSchema;
	readonly effects?: readonly {readonly schema: SequenceSchema}[];
	readonly id?: string;
	readonly overrideId?: string;
	readonly parentId?: string | null;
	readonly refForOutline?: RefObject<HTMLElement | null> | null;
	readonly duration?: number;
	readonly from?: number;
	readonly type?: TSequence['type'];
}): TSequence =>
	({
		type,
		from,
		duration,
		id,
		displayName: id,
		documentationLink: null,
		parent: parentId,
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
			overrideId,
			supportsEffects: true,
		},
		refForOutline,
		isInsideSeries: false,
		effects,
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

test('Timeline selection should stay disabled until released publicly', () => {
	expect(SELECTION_ENABLED).toBe(false);
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
							easing: ['linear'],
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
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
					easing: ['linear'],
					clamping: {left: 'clamp', right: 'clamp'},
				},
			},
		},
	]);
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
							easing: ['linear'],
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
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
			easing: ['linear'],
			clamping: {left: 'clamp', right: 'clamp'},
		},
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
	} satisfies SequenceSchema;
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
	} satisfies SequenceSchema;
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

test('Timeline top drag should not be enabled', () => {
	expect(TIMELINE_TOP_DRAG).toBe(false);
});

test('Timeline duration drag applies the same delta to selected sequences', () => {
	const schema = {} satisfies SequenceSchema;
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
});

test('Timeline duration drag uses the declared duration for negative from values', () => {
	const schema = {} satisfies SequenceSchema;
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
	const schema = {} satisfies SequenceSchema;
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
	const schema = {} satisfies SequenceSchema;
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
				easing: ['linear'],
				clamping: {left: 'clamp', right: 'clamp'},
				posterize: undefined,
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
	const schema = {} satisfies SequenceSchema;
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

test('Timeline from drag applies the same delta to selected sequences', () => {
	const schema = {} satisfies SequenceSchema;
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

test('Timeline from drag supports negative offsets', () => {
	expect(
		getTimelineSequenceFromDragValue({
			initialFrom: 4,
			deltaFrames: -10,
		}),
	).toBe(-6);
});

test('Timeline from drag saves relative from for nested sequences', () => {
	const schema = {} satisfies SequenceSchema;
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
	const schema = {} satisfies SequenceSchema;
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
				fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
				initialFrom: 5,
				nodePath: nodePathInfo.sequenceSubscriptionKey,
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

test('Timeline outlines should not be enabled', () => {
	expect(ENABLE_OUTLINES).toBe(false);
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

test('Canvas outline hit targets render nested sequences above parents', () => {
	const schema = {} satisfies SequenceSchema;
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
					lineTo: 'end',
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
					lineTo: 'end',
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
					lineTo: 'end',
				},
				value: [0.2, 0.3],
			},
			{
				effectIndex: 2,
				fieldKey: 'end',
				fieldSchema: {
					type: 'uv-coordinate',
					default: [1, 1],
					lineTo: 'start',
				},
				value: [0.8, 0.7],
			},
		],
	});

	expect(lines.map((line) => line.key)).toEqual(['2-start-end']);
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
	} as const satisfies SequenceSchema;
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
							easing: ['linear'],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
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
		opacity: {type: 'number', default: 1, hiddenFromList: false},
		'style.rotate': {type: 'rotation-css', default: '0deg'},
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
	} satisfies SequenceSchema;
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
					easing: ['linear'],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
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

test('Backspace reset skips keyframed sequence props without defaults', () => {
	const schema = {
		opacity: {type: 'number', default: undefined, hiddenFromList: false},
	} satisfies SequenceSchema;
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
					easing: ['linear'],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
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
	} satisfies SequenceSchema;
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

test('Selected outline dragging keyframed translate adds a keyframe at the source frame', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies SequenceSchema;
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
					easing: ['linear'],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
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
	} satisfies SequenceSchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify(1),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			startX: 2,
			startY: 3,
			startZ: 1,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '2 3'},
				fieldDefault: 1,
				fieldSchema: schema['style.scale'],
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

test('Selected outline edge dragging preserves aspect ratio when scale is linked', () => {
	const schema = {
		'style.scale': {type: 'scale', default: 1, max: 100},
	} satisfies SequenceSchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify(1),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			startX: 2,
			startY: 3,
			startZ: 1,
			target: {
				clientId: 'client',
				propStatus: {status: 'static', codeValue: '2 3'},
				fieldDefault: 1,
				fieldSchema: schema['style.scale'],
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
	} satisfies SequenceSchema;
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

test('Selected outline corner dragging keyframed rotation adds a keyframe at the source frame', () => {
	const schema = {
		'style.rotate': {type: 'rotation-css', default: '0deg'},
	} satisfies SequenceSchema;
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
					easing: ['linear'],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
				},
				fieldDefault: '0deg',
				fieldSchema: schema['style.rotate'],
				keyframeDisplayOffset: 30,
				nodePath,
				schema,
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
	expect(right?.extent).toBe(100);
	expect(right?.normal).toEqual({x: 1, y: 0});
	expect(top?.axis).toBe('y');
	expect(top?.extent).toBe(50);
	expect(top?.normal).toEqual({x: 0, y: -1});
});

test('Backspace reset targets selected effect props', () => {
	const schema = {} satisfies SequenceSchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies SequenceSchema;
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

test('Backspace reset targets selected keyframed effect props', () => {
	const schema = {} satisfies SequenceSchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies SequenceSchema;
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
							easing: ['linear'],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
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
	const schema = {} satisfies SequenceSchema;
	const effectSchema = {
		intensity: {type: 'number', default: undefined, hiddenFromList: false},
	} satisfies SequenceSchema;
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
							easing: ['linear'],
							clamping: {left: 'extend', right: 'extend'},
							posterize: undefined,
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
	} satisfies SequenceSchema;
	const effectSchema = {
		intensity: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies SequenceSchema;
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
	} satisfies SequenceSchema;
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

test('Deleting selected keyframes ignores selected easings', async () => {
	const schema = {
		opacity: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies SequenceSchema;
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
