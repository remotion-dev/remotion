import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	GetDragOverrides,
	OverrideIdToNodePaths,
	ResolvedStackLocation,
	SequenceFieldSchema,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLUE} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {ContextMenuForTarget} from './ContextMenu';
import {
	addEffectFromDragData,
	getEffectDragData,
	hasExplicitEffectDragType,
	hasEffectDragType,
} from './effect-drag-and-drop';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clamp,
	mixPoint,
	type OutlinePoint,
	type SelectedOutline,
} from './selected-outline-geometry';
import {
	getSelectedUvHandles,
	type SelectedOutlineUvHandle,
} from './selected-outline-uv';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import {callAddSequenceKeyframe} from './Timeline/call-add-keyframe';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './Timeline/save-sequence-prop';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {getLinkedScale} from './Timeline/TimelineScaleField';
import {
	ENABLE_OUTLINES,
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	type TimelineSelectionInteraction,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';

type SelectedOutlineContextMenuOpenResult =
	| false
	| void
	| readonly ComboboxValue[];

type SelectedOutlineContextMenuOpenHandler = () =>
	| SelectedOutlineContextMenuOpenResult
	| Promise<SelectedOutlineContextMenuOpenResult>;

type SelectedOutlineTarget = {
	readonly key: string;
	readonly containsSelection: boolean;
	readonly effectDrop: SelectedOutlineEffectDropTarget | null;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly ref: React.RefObject<Element | null>;
	readonly selected: boolean;
	readonly selection: TimelineSelection;
	readonly sequence: TSequence;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly scaleDrag: SelectedOutlineScaleDragTarget | null;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

type SelectedOutlineEffectDropTarget = {
	readonly clientId: string;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
};

type SelectedOutlineDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly keyframeDisplayOffset: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
};

type ScaleFieldSchema = Extract<SequenceFieldSchema, {type: 'scale'}>;

type SelectedOutlineScaleDragTarget = {
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly clientId: string;
	readonly fieldDefault: number | string | undefined;
	readonly fieldSchema: ScaleFieldSchema;
	readonly linked: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
};

export type SelectedOutlineDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly target: SelectedOutlineDragTarget;
};

export type SelectedOutlineScaleDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number;
	readonly target: SelectedOutlineScaleDragTarget;
};

type SequenceWithSelectedOutline = {
	readonly depth: number;
	readonly keyframeDisplayOffset: number;
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

const translateFieldKey = 'style.translate';
const scaleFieldKey = 'style.scale';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

const emptyContextMenuValues: readonly ComboboxValue[] = [];

const pointToString = (point: OutlinePoint) => `${point.x},${point.y}`;

const midpoint = (from: OutlinePoint, to: OutlinePoint): OutlinePoint => {
	return mixPoint(from, to, 0.5);
};

const dot = (left: OutlinePoint, right: OutlinePoint): number => {
	return left.x * right.x + left.y * right.y;
};

const vectorLength = (vector: OutlinePoint): number => {
	return Math.hypot(vector.x, vector.y);
};

const vectorBetween = (from: OutlinePoint, to: OutlinePoint): OutlinePoint => {
	return {x: to.x - from.x, y: to.y - from.y};
};

const rectToPoints = (
	elementRect: DOMRect,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	const left = elementRect.left - containerRect.left;
	const top = elementRect.top - containerRect.top;
	const right = elementRect.right - containerRect.left;
	const bottom = elementRect.bottom - containerRect.top;

	return [
		{x: left, y: top},
		{x: right, y: top},
		{x: right, y: bottom},
		{x: left, y: bottom},
	];
};

const quadToPoints = (
	quad: DOMQuad,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	// `getBoxQuads`/the ponyfill returns the quad in viewport coordinates.
	// The overlay <svg> is unscaled (the canvas `scale()`/pan live on a sibling
	// container, not the svg), so 1 user unit == 1 px and we only need to move
	// the quad into the svg's local space by subtracting its viewport origin.
	// We deliberately do not pass `relativeTo` to the ponyfill: when the target
	// is not an ancestor of the element, the polyfill cannot resolve the
	// coordinate space and leaves the quad in viewport coordinates.
	return [
		{x: quad.p1.x - containerRect.left, y: quad.p1.y - containerRect.top},
		{x: quad.p2.x - containerRect.left, y: quad.p2.y - containerRect.top},
		{x: quad.p3.x - containerRect.left, y: quad.p3.y - containerRect.top},
		{x: quad.p4.x - containerRect.left, y: quad.p4.y - containerRect.top},
	];
};

const getElementOutlinePoints = (
	element: Element,
	containerRect: DOMRect,
): SelectedOutline['points'] | null => {
	const elementRect = element.getBoundingClientRect();

	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	const quads = getBoxQuadsPonyfill(element, {
		box: 'border',
	});
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, containerRect);
	}

	return quadToPoints(quad, containerRect);
};

export const getSelectedSequenceKeys = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems
			.filter((item) => item.type === 'sequence')
			.map((item) => getTimelineSequenceSelectionKey(item.nodePathInfo)),
	);
};

const getSequenceKeysContainingSelection = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems.map((item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo),
		),
	);
};

export const getOutlineSelectionInteraction = ({
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}): TimelineSelectionInteraction => ({
	shiftKey,
	toggleKey: metaKey || ctrlKey,
});

type SelectedEffectFields = {
	allFields: boolean;
	fieldKeys: Set<string>;
};

export const getSelectedEffectFieldsBySequenceKey = (
	selectedItems: readonly TimelineSelection[],
): Map<string, Map<number, SelectedEffectFields>> => {
	const selectedEffects = new Map<string, Map<number, SelectedEffectFields>>();

	for (const item of selectedItems) {
		if (
			item.type !== 'sequence-effect' &&
			item.type !== 'sequence-effect-prop'
		) {
			continue;
		}

		const sequenceKey = getTimelineSequenceSelectionKey(item.nodePathInfo);
		const effectsForSequence =
			selectedEffects.get(sequenceKey) ??
			new Map<number, SelectedEffectFields>();
		const selectedFields = effectsForSequence.get(item.i) ?? {
			allFields: false,
			fieldKeys: new Set<string>(),
		};

		if (item.type === 'sequence-effect') {
			selectedFields.allFields = true;
		} else {
			selectedFields.fieldKeys.add(item.key);
		}

		effectsForSequence.set(item.i, selectedFields);
		selectedEffects.set(sequenceKey, effectsForSequence);
	}

	return selectedEffects;
};

export const getSequencesWithSelectableOutlines = ({
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): SequenceWithSelectedOutline[] => {
	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return track.nodePathInfo.auxiliaryKeys.length === 0;
		})
		.filter((track) => track.sequence.refForOutline !== null)
		.sort((a, b) => a.depth - b.depth)
		.map((track) => {
			if (track.nodePathInfo === null) {
				throw new Error('Expected selected outline to have a node path');
			}

			return {
				depth: track.depth,
				keyframeDisplayOffset: track.keyframeDisplayOffset,
				key: getTimelineSequenceSelectionKey(track.nodePathInfo),
				nodePathInfo: track.nodePathInfo,
				sequence: track.sequence,
			};
		});
};

const measureOutlines = (
	container: SVGSVGElement,
	targets: readonly SelectedOutlineTarget[],
): SelectedOutline[] => {
	const containerRect = container.getBoundingClientRect();
	const outlines: SelectedOutline[] = [];

	for (const target of targets) {
		const element = target.ref.current;
		if (element === null) {
			continue;
		}

		const points = getElementOutlinePoints(element, containerRect);
		if (points === null) {
			continue;
		}

		outlines.push({key: target.key, points});
	}

	return outlines;
};

const outlinesAreEqual = (
	a: readonly SelectedOutline[],
	b: readonly SelectedOutline[],
): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i].key !== b[i].key) {
			return false;
		}

		for (let j = 0; j < a[i].points.length; j++) {
			if (
				Math.abs(a[i].points[j].x - b[i].points[j].x) > 0.01 ||
				Math.abs(a[i].points[j].y - b[i].points[j].y) > 0.01
			) {
				return false;
			}
		}
	}

	return true;
};

const getSelectedOutlineDragStates = ({
	dragTargets,
	getDragOverrides,
	timelinePosition,
}: {
	readonly dragTargets: readonly SelectedOutlineDragTarget[];
	readonly getDragOverrides: GetDragOverrides;
	readonly timelinePosition: number;
}): SelectedOutlineDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			translateFieldKey
		];
		const sourceFrame = timelinePosition - target.keyframeDisplayOffset;
		const effectiveValue = Internals.getEffectiveVisualModeValue({
			propStatus: target.propStatus,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			frame: sourceFrame,
			shouldResortToDefaultValueIfUndefined: true,
		});
		const [startX, startY] = parseTranslate(
			String(effectiveValue ?? '0px 0px'),
		);

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			sourceFrame,
			startX,
			startY,
			target,
		};
	});
};

export const getSelectedOutlineDragValues = ({
	dragStates,
	deltaX,
	deltaY,
}: {
	readonly dragStates: readonly SelectedOutlineDragState[];
	readonly deltaX: number;
	readonly deltaY: number;
}): Map<string, string> => {
	return new Map(
		dragStates.map((dragState) => [
			dragState.key,
			serializeTranslate(dragState.startX + deltaX, dragState.startY + deltaY),
		]),
	);
};

export const applySelectedOutlineDragAxisLock = ({
	deltaX,
	deltaY,
	axisLocked,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly axisLocked: boolean;
}) => {
	if (!axisLocked) {
		return {deltaX, deltaY};
	}

	if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		return {deltaX, deltaY: 0};
	}

	return {deltaX: 0, deltaY};
};

export type SelectedOutlineStaticDragChange = SaveSequencePropChange & {
	readonly type: 'static';
};

export type SelectedOutlineKeyframedDragChange = {
	readonly type: 'keyframed';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly sourceFrame: number;
	readonly value: unknown;
	readonly schema: SequenceSchema;
	readonly clientId: string;
};

export type SelectedOutlineDragChange =
	| SelectedOutlineStaticDragChange
	| SelectedOutlineKeyframedDragChange;

export const getSelectedOutlineDragChanges = ({
	dragStates,
	lastValues,
}: {
	readonly dragStates: readonly SelectedOutlineDragState[];
	readonly lastValues: ReadonlyMap<string, string>;
}): SelectedOutlineDragChange[] => {
	const changes: SelectedOutlineDragChange[] = [];

	for (const dragState of dragStates) {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			continue;
		}

		if (dragState.target.propStatus.status === 'keyframed') {
			const startValue = serializeTranslate(dragState.startX, dragState.startY);
			if (value === startValue) {
				continue;
			}

			changes.push({
				type: 'keyframed',
				fileName: dragState.target.nodePath.absolutePath,
				nodePath: dragState.target.nodePath,
				fieldKey: translateFieldKey,
				sourceFrame: dragState.sourceFrame,
				value,
				schema: dragState.target.schema,
				clientId: dragState.target.clientId,
			});
			continue;
		}

		const stringifiedValue = JSON.stringify(value);
		const shouldSave =
			value !== dragState.target.propStatus.codeValue &&
			!(
				dragState.defaultValue === stringifiedValue &&
				dragState.target.propStatus.codeValue === undefined
			);

		if (!shouldSave) {
			continue;
		}

		changes.push({
			type: 'static',
			fileName: dragState.target.nodePath.absolutePath,
			nodePath: dragState.target.nodePath,
			fieldKey: translateFieldKey,
			value,
			defaultValue: dragState.defaultValue,
			schema: dragState.target.schema,
		});
	}

	return changes;
};

export type SelectedOutlineScaleEdge = 'top' | 'right' | 'bottom' | 'left';

type SelectedOutlineScaleEdgeInfo = {
	readonly axis: 'x' | 'y';
	readonly cursor: React.CSSProperties['cursor'];
	readonly end: OutlinePoint;
	readonly extent: number;
	readonly normal: OutlinePoint;
	readonly start: OutlinePoint;
};

export const getSelectedOutlineScaleEdgeInfo = (
	points: SelectedOutline['points'],
	edge: SelectedOutlineScaleEdge,
): SelectedOutlineScaleEdgeInfo | null => {
	const [tl, tr, br, bl] = points;
	const edgePoints = {
		top: {start: tl, end: tr, oppositeStart: bl, oppositeEnd: br},
		right: {start: tr, end: br, oppositeStart: tl, oppositeEnd: bl},
		bottom: {start: bl, end: br, oppositeStart: tl, oppositeEnd: tr},
		left: {start: tl, end: bl, oppositeStart: tr, oppositeEnd: br},
	}[edge];
	const edgeMidpoint = midpoint(edgePoints.start, edgePoints.end);
	const oppositeMidpoint = midpoint(
		edgePoints.oppositeStart,
		edgePoints.oppositeEnd,
	);
	const outward = vectorBetween(oppositeMidpoint, edgeMidpoint);
	const length = vectorLength(outward);

	if (length < 0.001) {
		return null;
	}

	return {
		axis: edge === 'left' || edge === 'right' ? 'x' : 'y',
		cursor: edge === 'left' || edge === 'right' ? 'ew-resize' : 'ns-resize',
		end: edgePoints.end,
		extent: length,
		normal: {x: outward.x / length, y: outward.y / length},
		start: edgePoints.start,
	};
};

export const getSelectedOutlineScaleDragStates = ({
	dragTargets,
	getDragOverrides,
}: {
	readonly dragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly getDragOverrides: GetDragOverrides;
}): SelectedOutlineScaleDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			scaleFieldKey
		];
		const effectiveValue = Internals.getEffectiveVisualModeValue({
			propStatus: target.propStatus,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			shouldResortToDefaultValueIfUndefined: true,
		});
		const [startX, startY, startZ] =
			NoReactInternals.parseScaleValue(effectiveValue);

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			startX,
			startY,
			startZ,
			target,
		};
	});
};

export const getSelectedOutlineScaleDragValues = ({
	axis,
	dragStates,
	scaleFactor,
}: {
	readonly axis: 'x' | 'y';
	readonly dragStates: readonly SelectedOutlineScaleDragState[];
	readonly scaleFactor: number;
}): Map<string, number | string> => {
	return new Map(
		dragStates.map((dragState) => {
			const min = dragState.target.fieldSchema.min ?? -Infinity;
			const max = dragState.target.fieldSchema.max ?? Infinity;
			const baseX = dragState.startX;
			const baseY = dragState.startY;
			const newValue = (axis === 'x' ? baseX : baseY) * scaleFactor;
			const [x, y] = dragState.target.linked
				? getLinkedScale({
						axis,
						newValue,
						baseX,
						baseY,
						min,
						max,
					})
				: axis === 'x'
					? [clamp(newValue, min, max), baseY]
					: [baseX, clamp(newValue, min, max)];

			return [
				dragState.key,
				NoReactInternals.serializeScaleValue([x, y, dragState.startZ]),
			];
		}),
	);
};

export const getSelectedOutlineScaleDragChanges = ({
	dragStates,
	lastValues,
}: {
	readonly dragStates: readonly SelectedOutlineScaleDragState[];
	readonly lastValues: ReadonlyMap<string, number | string>;
}) => {
	return dragStates.flatMap((dragState) => {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			return [];
		}

		const stringifiedValue = JSON.stringify(value);
		const shouldSave =
			stringifiedValue !==
				JSON.stringify(dragState.target.propStatus.codeValue) &&
			!(
				dragState.defaultValue === stringifiedValue &&
				dragState.target.propStatus.codeValue === undefined
			);

		if (!shouldSave) {
			return [];
		}

		return [
			{
				fileName: dragState.target.nodePath.absolutePath,
				nodePath: dragState.target.nodePath,
				fieldKey: scaleFieldKey,
				value,
				defaultValue: dragState.defaultValue,
				schema: dragState.target.schema,
			},
		];
	});
};

const clearSelectedOutlineDragOverrides = ({
	clearDragOverrides,
	dragStates,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly dragStates: readonly SelectedOutlineDragState[];
}) => {
	for (const dragState of dragStates) {
		clearDragOverrides(dragState.target.nodePath);
	}
};

const clearSelectedOutlineScaleDragOverrides = ({
	clearDragOverrides,
	dragStates,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly dragStates: readonly SelectedOutlineScaleDragState[];
}) => {
	for (const dragState of dragStates) {
		clearDragOverrides(dragState.target.nodePath);
	}
};

const SelectedOutlinePolygon: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly dragging: boolean;
	readonly hovered: boolean;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	contextMenuValues,
	dragging,
	hovered,
	onContextMenuOpen,
	outline,
	onDraggingChange,
	onHoverChange,
	onSelect,
	scale,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
	const polygonRef = useRef<SVGPolygonElement>(null);
	const points = useMemo(
		() => outline.points.map(pointToString).join(' '),
		[outline.points],
	);
	const drag = target?.drag ?? null;
	const selected = target?.selected ?? false;
	const containsSelection = target?.containsSelection ?? false;
	const effectDrop = target?.effectDrop ?? null;
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const visible = containsSelection || hovered;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPolygonElement>) => {
			if (event.button !== 0 || target === undefined) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const interaction = getOutlineSelectionInteraction(event);
			const shouldUpdateSelection =
				!selected || interaction.shiftKey || interaction.toggleKey;
			if (shouldUpdateSelection) {
				onSelect(target.selection, interaction);
			}

			if (drag === null || interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			onDraggingChange(true);

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragStates = getSelectedOutlineDragStates({
				dragTargets: selected ? allDragTargets : [drag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
			});
			let lastValues = new Map<string, string>();
			let currentPointerX = startPointerX;
			let currentPointerY = startPointerY;
			let axisLocked = false;

			const updateDragOverrides = () => {
				const dragDelta = applySelectedOutlineDragAxisLock({
					deltaX: (currentPointerX - startPointerX) / scale,
					deltaY: (currentPointerY - startPointerY) / scale,
					axisLocked,
				});

				lastValues = getSelectedOutlineDragValues({
					dragStates,
					deltaX: dragDelta.deltaX,
					deltaY: dragDelta.deltaY,
				});
				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							translateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							translateFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				currentPointerX = moveEvent.clientX;
				currentPointerY = moveEvent.clientY;
				axisLocked = moveEvent.shiftKey;
				updateDragOverrides();
			};

			const onKeyChange = (keyEvent: KeyboardEvent) => {
				if (keyEvent.key !== 'Shift') {
					return;
				}

				const nextAxisLocked = keyEvent.type === 'keydown';
				if (nextAxisLocked === axisLocked) {
					return;
				}

				axisLocked = nextAxisLocked;
				updateDragOverrides();
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				onDraggingChange(false);

				const changes = getSelectedOutlineDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					return;
				}

				const staticChanges = changes.filter(
					(change): change is SelectedOutlineStaticDragChange =>
						change.type === 'static',
				);
				const keyframedChanges = changes.filter(
					(change): change is SelectedOutlineKeyframedDragChange =>
						change.type === 'keyframed',
				);

				Promise.all([
					staticChanges.length > 0
						? saveSequenceProps({
								changes: staticChanges,
								setPropStatuses,
								clientId: drag.clientId,
								undoLabel:
									changes.length > 1
										? 'Move selected sequences'
										: 'Move sequence',
								redoLabel:
									changes.length > 1
										? 'Move selected sequences back'
										: 'Move sequence back',
							})
						: Promise.resolve(),
					...keyframedChanges.map((change) =>
						callAddSequenceKeyframe({
							fileName: change.fileName,
							nodePath: change.nodePath,
							fieldKey: change.fieldKey,
							sourceFrame: change.sourceFrame,
							value: change.value,
							schema: change.schema,
							setPropStatuses,
							clientId: change.clientId,
						}),
					),
				])
					.catch((err) => {
						showNotification(
							`Could not save sequence props: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			allDragTargets,
			clearDragOverrides,
			drag,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			scale,
			selected,
			setPropStatuses,
			setDragOverrides,
			target,
		],
	);

	const onEffectDragOver = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			if (effectDrop === null || !hasEffectDragType(event.dataTransfer)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[effectDrop],
	);

	const onEffectDragLeave = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
				return;
			}

			setEffectDropHovered(false);
		},
		[],
	);

	const onEffectDrop = React.useCallback(
		async (event: React.DragEvent<SVGPolygonElement>) => {
			if (effectDrop === null || !hasEffectDragType(event.dataTransfer)) {
				return;
			}

			const dragData = getEffectDragData(event.dataTransfer);
			if (!dragData) {
				if (hasExplicitEffectDragType(event.dataTransfer)) {
					event.preventDefault();
					event.stopPropagation();
					setEffectDropHovered(false);
					showNotification('Could not read effect drag data', 3000);
				}

				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setEffectDropHovered(false);

			await addEffectFromDragData({
				dragData,
				fileName: effectDrop.fileName,
				nodePath: effectDrop.nodePath,
				clientId: effectDrop.clientId,
			});
		},
		[effectDrop],
	);

	return (
		<>
			<polygon
				ref={polygonRef}
				points={points}
				fill={effectDropHovered ? 'rgba(0, 155, 255, 0.12)' : 'transparent'}
				stroke={BLUE}
				strokeOpacity={visible || effectDropHovered ? 1 : 0}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
				pointerEvents={target === undefined ? undefined : 'all'}
				onPointerEnter={() => {
					if (!dragging) {
						onHoverChange(outline.key);
					}
				}}
				onPointerLeave={() => {
					if (!dragging) {
						onHoverChange(null);
					}
				}}
				onPointerDown={onPointerDown}
				onDragOver={effectDrop === null ? undefined : onEffectDragOver}
				onDragLeave={effectDrop === null ? undefined : onEffectDragLeave}
				onDrop={effectDrop === null ? undefined : onEffectDrop}
			/>
			<ContextMenuForTarget
				triggerRef={polygonRef}
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

const SelectedOutlineScaleEdgeLine: React.FC<{
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly dragging: boolean;
	readonly edge: SelectedOutlineScaleEdge;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allScaleDragTargets,
	contextMenuValues,
	dragging,
	edge,
	outline,
	onDraggingChange,
	onContextMenuOpen,
	onHoverChange,
	onSelect,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const scaleDrag = target?.scaleDrag ?? null;
	const selected = target?.selected ?? false;
	const lineRef = useRef<SVGLineElement>(null);
	const edgeInfo = useMemo(
		() => getSelectedOutlineScaleEdgeInfo(outline.points, edge),
		[edge, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGLineElement>) => {
			if (event.button !== 0 || scaleDrag === null || edgeInfo === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const interaction = getOutlineSelectionInteraction(event);
			const shouldUpdateSelection =
				!selected || interaction.shiftKey || interaction.toggleKey;
			if (shouldUpdateSelection && target !== undefined) {
				onSelect(target.selection, interaction);
			}

			if (interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			onDraggingChange(true);

			const startPointer = {x: event.clientX, y: event.clientY};
			const dragStates = getSelectedOutlineScaleDragStates({
				dragTargets: selected ? allScaleDragTargets : [scaleDrag],
				getDragOverrides,
			});
			let lastValues = new Map<string, number | string>();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const delta = {
					x: moveEvent.clientX - startPointer.x,
					y: moveEvent.clientY - startPointer.y,
				};
				const projectedDelta = dot(delta, edgeInfo.normal);
				const scaleFactor = Math.max(
					0.001,
					1 + projectedDelta / edgeInfo.extent,
				);

				lastValues = getSelectedOutlineScaleDragValues({
					dragStates,
					axis: edgeInfo.axis,
					scaleFactor,
				});

				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected scale drag value to be available');
					}

					setDragOverrides(
						dragState.target.nodePath,
						scaleFieldKey,
						Internals.makeStaticDragOverride(value),
					);
				}
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				onDraggingChange(false);

				const changes = getSelectedOutlineScaleDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineScaleDragOverrides({
						clearDragOverrides,
						dragStates,
					});
					return;
				}

				saveSequenceProps({
					changes,
					setPropStatuses,
					clientId: scaleDrag.clientId,
					undoLabel:
						changes.length > 1 ? 'Scale selected sequences' : 'Scale sequence',
					redoLabel:
						changes.length > 1
							? 'Scale selected sequences back'
							: 'Scale sequence back',
				})
					.catch((err) => {
						showNotification(
							`Could not save sequence props: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearSelectedOutlineScaleDragOverrides({
							clearDragOverrides,
							dragStates,
						});
					});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			allScaleDragTargets,
			clearDragOverrides,
			edgeInfo,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			scaleDrag,
			selected,
			setPropStatuses,
			setDragOverrides,
			target,
		],
	);

	if (scaleDrag === null || edgeInfo === null) {
		return null;
	}

	return (
		<>
			<line
				ref={lineRef}
				x1={edgeInfo.start.x}
				y1={edgeInfo.start.y}
				x2={edgeInfo.end.x}
				y2={edgeInfo.end.y}
				stroke="transparent"
				strokeWidth={12}
				vectorEffect="non-scaling-stroke"
				pointerEvents="stroke"
				cursor={edgeInfo.cursor}
				onPointerEnter={() => {
					if (!dragging) {
						onHoverChange(outline.key);
					}
				}}
				onPointerLeave={() => {
					if (!dragging) {
						onHoverChange(null);
					}
				}}
				onPointerDown={onPointerDown}
			/>
			<ContextMenuForTarget
				triggerRef={lineRef}
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

const SelectedOutlineElement: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly dragging: boolean;
	readonly hovered: boolean;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	allScaleDragTargets,
	dragging,
	hovered,
	outline,
	onDraggingChange,
	onHoverChange,
	onSelect,
	scale,
	target,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);

	const onContextMenuOpen = React.useCallback(async () => {
		if (target === undefined || previewServerState.type !== 'connected') {
			return false;
		}

		if (!target.selected) {
			onSelect(target.selection, {shiftKey: false, toggleKey: false});
		}

		const stack = target.sequence.getStack();
		let originalLocation: ResolvedStackLocation | null = null;
		if (stack) {
			try {
				originalLocation = await getOriginalLocationFromStack(
					stack,
					'sequence',
				);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		}

		if (stack) {
			updateResolvedStackTrace(stack, originalLocation);
		}

		const fileLocation = formatFileLocation({
			location: originalLocation,
			root: window.remotion_cwd,
		});
		const editorName = window.remotion_editorName;

		return [
			editorName
				? {
						type: 'item' as const,
						id: 'show-outline-in-editor',
						keyHint: null,
						label: `Show in ${editorName}`,
						leftItem: null,
						disabled: !originalLocation,
						onClick: () => {
							if (!originalLocation) {
								return;
							}

							openOriginalPositionInEditor(originalLocation).catch((err) => {
								showNotification((err as Error).message, 2000);
							});
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-outline-in-editor',
					}
				: null,
			{
				type: 'item' as const,
				id: 'copy-outline-file-location',
				keyHint: null,
				label: 'Copy file location',
				leftItem: null,
				disabled: !fileLocation,
				onClick: () => {
					if (!fileLocation) {
						return;
					}

					navigator.clipboard
						.writeText(fileLocation)
						.then(() => {
							showNotification('Copied file location to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy to clipboard: ${(err as Error).message}`,
								1000,
							);
						});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'copy-outline-file-location',
			},
		].filter(NoReactInternals.truthy);
	}, [onSelect, previewServerState.type, target, updateResolvedStackTrace]);

	return (
		<>
			<SelectedOutlinePolygon
				allDragTargets={allDragTargets}
				contextMenuValues={emptyContextMenuValues}
				dragging={dragging}
				hovered={hovered}
				outline={outline}
				onContextMenuOpen={onContextMenuOpen}
				onDraggingChange={onDraggingChange}
				onHoverChange={onHoverChange}
				onSelect={onSelect}
				scale={scale}
				target={target}
			/>
			{target?.containsSelection || hovered
				? (['top', 'right', 'bottom', 'left'] as const).map((edge) => (
						<SelectedOutlineScaleEdgeLine
							key={edge}
							allScaleDragTargets={allScaleDragTargets}
							contextMenuValues={emptyContextMenuValues}
							dragging={dragging}
							edge={edge}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
		</>
	);
};

export const SelectedOutlineOverlay: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {getScaleLockState} = useContext(ScaleLockContext);
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const [hoveredOutlineKey, setHoveredOutlineKey] = useState<string | null>(
		null,
	);
	const [draggingOutline, setDraggingOutline] = useState(false);
	const overlayRef = useRef<SVGSVGElement>(null);

	const onDraggingChange = React.useCallback((dragging: boolean) => {
		setDraggingOutline(dragging);
		if (dragging) {
			setHoveredOutlineKey(null);
		}
	}, []);

	const outlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!ENABLE_OUTLINES || !editorShowOutlines) {
			return [];
		}

		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
		const sequenceKeysContainingSelection =
			getSequenceKeysContainingSelection(selectedItems);
		const selectedEffectsBySequenceKey =
			getSelectedEffectFieldsBySequenceKey(selectedItems);
		const clientId =
			previewServerState.type === 'connected'
				? previewServerState.clientId
				: null;

		return getSequencesWithSelectableOutlines({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).map(({key, keyframeDisplayOffset, nodePathInfo, sequence}) => {
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			const selected = selectedSequenceKeys.has(key);
			const containsSelection = sequenceKeysContainingSelection.has(key);
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const {controls} = sequence;
			const fieldSchema = controls?.schema[translateFieldKey];
			const propStatus = Internals.getPropStatusesCtx(propStatuses, nodePath)?.[
				translateFieldKey
			];
			const scaleFieldSchema = controls?.schema[scaleFieldKey];
			const scalePropStatus = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			)?.[scaleFieldKey];
			const canDragStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				canDragStatus;
			const canScaleDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				scalePropStatus?.status === 'static';
			const canDropEffect =
				previewServerState.type === 'connected' &&
				controls?.supportsEffects === true;

			return {
				key,
				containsSelection,
				effectDrop: canDropEffect
					? {
							clientId: previewServerState.clientId,
							fileName: nodePath.absolutePath,
							nodePath,
						}
					: null,
				nodePathInfo,
				ref: sequence.refForOutline,
				selected,
				selection: {type: 'sequence', nodePathInfo},
				sequence,
				drag: canDrag
					? {
							propStatus,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							propStatus: scalePropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: scaleFieldSchema.default,
							fieldSchema: scaleFieldSchema,
							linked: getScaleLockState({
								nodePath,
								fieldKey: scaleFieldKey,
								defaultValue: (() => {
									const dragOverrideValue = (getDragOverrides(nodePath) ?? {})[
										scaleFieldKey
									];
									const effectiveValue = Internals.getEffectiveVisualModeValue({
										propStatus: scalePropStatus,
										dragOverrideValue,
										defaultValue: scaleFieldSchema.default,
										shouldResortToDefaultValueIfUndefined: true,
									});
									const [x, y] =
										NoReactInternals.parseScaleValue(effectiveValue);
									return x === y;
								})(),
							}),
							nodePath,
							schema: controls.schema,
						}
					: null,
				uvHandles: containsSelection
					? getSelectedUvHandles({
							propStatuses,
							clientId,
							getEffectDragOverrides,
							nodePath,
							selectedEffects: selectedEffectsBySequenceKey.get(key),
							sequence,
							sourceFrame: timelinePosition - keyframeDisplayOffset,
						})
					: [],
			};
		});
	}, [
		propStatuses,
		getDragOverrides,
		getEffectDragOverrides,
		getScaleLockState,
		editorShowOutlines,
		overrideIdToNodePathMappings,
		previewServerState,
		selectedItems,
		sequences,
		timelinePosition,
	]);

	useEffect(() => {
		if (
			hoveredOutlineKey !== null &&
			!outlineTargets.some((target) => target.key === hoveredOutlineKey)
		) {
			setHoveredOutlineKey(null);
		}
	}, [hoveredOutlineKey, outlineTargets]);

	const targetsByKey = useMemo(() => {
		return new Map(outlineTargets.map((target) => [target.key, target]));
	}, [outlineTargets]);
	const allDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.drag !== null ? [target.drag] : [],
		);
	}, [outlineTargets]);
	const allScaleDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.scaleDrag !== null ? [target.scaleDrag] : [],
		);
	}, [outlineTargets]);

	useEffect(() => {
		if (outlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		let animationFrame: number | null = null;

		const updateOutlines = () => {
			if (overlayRef.current) {
				const nextOutlines = measureOutlines(
					overlayRef.current,
					outlineTargets,
				);
				setOutlines((prevOutlines) =>
					outlinesAreEqual(prevOutlines, nextOutlines)
						? prevOutlines
						: nextOutlines,
				);
			}

			animationFrame = requestAnimationFrame(updateOutlines);
		};

		updateOutlines();

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [outlineTargets]);

	if (outlineTargets.length === 0) {
		return null;
	}

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			{outlines.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					allDragTargets={allDragTargets}
					allScaleDragTargets={allScaleDragTargets}
					dragging={draggingOutline}
					hovered={hoveredOutlineKey === outline.key}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onHoverChange={setHoveredOutlineKey}
					onSelect={selectItem}
					scale={scale}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlines.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{outlines.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};
