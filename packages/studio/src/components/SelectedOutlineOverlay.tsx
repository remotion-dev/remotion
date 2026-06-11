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
	hasEffectDragType,
	hasExplicitEffectDragType,
} from './effect-drag-and-drop';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
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
	getUvCoordinateForPoint,
	getUvHandlePosition,
	type SelectedOutlineUvHandle,
} from './selected-outline-uv';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import {
	callAddKeyframes,
	callAddSequenceKeyframe,
	type AddSequenceKeyframeChange,
} from './Timeline/call-add-keyframe';
import {disableSequenceInteractivity} from './Timeline/disable-sequence-interactivity';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './Timeline/save-sequence-prop';
import {
	parseCssRotationToDegrees,
	serializeCssRotation,
} from './Timeline/timeline-rotation-utils';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {getLinkedScale} from './Timeline/TimelineScaleField';
import {
	getTimelineSequenceSelectionKey,
	useTimelineSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {
	parseTransformOrigin,
	parsedTransformOriginToUv,
	serializeTransformOrigin,
} from './Timeline/transform-origin-utils';

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
	readonly rotationDrag: SelectedOutlineRotationDragTarget | null;
	readonly transformOriginDrag: SelectedOutlineTransformOriginDragTarget | null;
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

type SelectedOutlineTransformOriginDragTarget = {
	readonly clientId: string;
	readonly keyframeDisplayOffset: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly originDefault: string | undefined;
	readonly originPropStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly originValue: string;
	readonly rotateValue: string;
	readonly scaleValue: number | string;
	readonly schema: SequenceSchema;
	readonly sourceFrame: number;
	readonly translateDefault: string | undefined;
	readonly translatePropStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly translateValue: string;
};

type ScaleFieldSchema = Extract<SequenceFieldSchema, {type: 'scale'}>;
type RotationFieldSchema = Extract<SequenceFieldSchema, {type: 'rotation-css'}>;

type SelectedOutlineScaleDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: number | string | undefined;
	readonly fieldSchema: ScaleFieldSchema;
	readonly keyframeDisplayOffset: number;
	readonly linked: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
};

type SelectedOutlineRotationDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly fieldSchema: RotationFieldSchema;
	readonly keyframeDisplayOffset: number;
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
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number;
	readonly target: SelectedOutlineScaleDragTarget;
};

export type SelectedOutlineRotationDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startDegrees: number;
	readonly target: SelectedOutlineRotationDragTarget;
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
const rotateFieldKey = 'style.rotate';
const transformOriginFieldKey = 'style.transformOrigin';

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

const getOutlineCenter = (points: SelectedOutline['points']): OutlinePoint => {
	const [tl, tr, br, bl] = points;
	return {
		x: (tl.x + tr.x + br.x + bl.x) / 4,
		y: (tl.y + tr.y + br.y + bl.y) / 4,
	};
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

const getAngleDegrees = (from: OutlinePoint, to: OutlinePoint): number => {
	return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
};

export const getSelectedOutlineRotationDeltaDegrees = ({
	from,
	to,
}: {
	readonly from: number;
	readonly to: number;
}) => {
	return ((((to - from) % 360) + 540) % 360) - 180;
};

export type SelectedOutlineRotationCorner =
	| 'top-left'
	| 'top-right'
	| 'bottom-right'
	| 'bottom-left';

const normalizeRotationCursorDegrees = (rotation: number): number => {
	const normalizedRotation = ((rotation % 360) + 360) % 360;
	return Number(normalizedRotation.toFixed(3));
};

const getRotationCursor = (rotation: number): string => {
	const normalizedRotation = normalizeRotationCursorDegrees(rotation);
	const transform =
		normalizedRotation === 0
			? ''
			: `<g transform="rotate(${normalizedRotation} 32 32)">`;
	const transformEnd = normalizedRotation === 0 ? '' : '</g>';
	const svg = `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${transform}<g transform="scale(0.876712329)" filter="url(#filter0_d_1_14)"><path d="M10.9111 17.7687C10.3413 18.3701 10.367 19.3195 10.9684 19.8893L20.7687 29.1738C21.3701 29.7436 22.3195 29.7179 22.8893 29.1165C23.459 28.5151 23.4334 27.5657 22.832 26.996L14.1206 18.7431L22.3735 10.0316C22.9432 9.43022 22.9176 8.48082 22.3162 7.91107C21.7148 7.34133 20.7654 7.36699 20.1956 7.96839L10.9111 17.7687ZM49.3923 58.3118C49.9509 58.9235 50.8996 58.9667 51.5114 58.4081L61.481 49.3055C62.0927 48.7469 62.1359 47.7981 61.5773 47.1863C61.0187 46.5745 60.0699 46.5314 59.4581 47.09L50.5963 55.1812L42.5051 46.3194C41.9465 45.7076 40.9977 45.6645 40.386 46.2231C39.7742 46.7817 39.7311 47.7304 40.2896 48.3422L49.3923 58.3118ZM12.6747 18.7431L13 19.8893C22.1283 19.6426 30.7584 21.4283 37.8564 26.6927C44.8518 31.8809 49.734 39.8538 49 56H50.5963H51.5114C52.2774 39.1461 47.6482 30.2198 39.6436 24.2831C31.7416 18.4224 22.3717 17.2467 13 17.5L12.6747 18.7431Z" fill="black"/><path d="M19.1064 6.93652C20.2459 5.73379 22.1448 5.68278 23.3477 6.82227C24.5505 7.96181 24.6022 9.86076 23.4629 11.0635L18.7373 16.0508C26.3487 16.4239 33.9128 18.1651 40.5371 23.0781C44.7339 26.1907 48.0794 30.1189 50.2568 35.4834C51.9666 39.6958 52.9327 44.7395 53.0742 50.8867L58.4463 45.9824C59.6697 44.8654 61.5673 44.9514 62.6846 46.1748C63.8018 47.3985 63.7155 49.296 62.4922 50.4131L52.5225 59.5156C51.337 60.5979 49.5196 60.5507 48.3916 59.4346L48.2842 59.3232L39.1816 49.3535C38.0648 48.1301 38.1507 46.2324 39.374 45.1152C40.5975 43.9979 42.4961 44.0841 43.6133 45.3076L47.4756 49.5381C47.1908 44.7613 46.2876 40.9448 44.9482 37.8291C43.0666 33.4521 40.2851 30.3614 36.9629 27.8975C31.8259 24.0875 25.8071 22.1663 19.2891 21.5732L23.8633 25.9072C25.0662 27.0468 25.1178 28.9457 23.9785 30.1484C22.8746 31.3135 21.0576 31.3982 19.8516 30.3662L19.7373 30.2627L9.93652 20.9785C8.73384 19.839 8.6828 17.9401 9.82227 16.7373L19.1064 6.93652Z" stroke="white" stroke-width="3"/></g>${transformEnd}<defs><filter id="filter0_d_1_14" x="0" y="0" width="72.4696" height="72.3004" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="3"/><feGaussianBlur stdDeviation="3.75"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape"/></filter></defs></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12, alias`;
};

const rotationCursorBaseDegrees = {
	'top-left': 270,
	'top-right': 0,
	'bottom-right': 90,
	'bottom-left': 180,
} satisfies Record<SelectedOutlineRotationCorner, number>;

const getOutlineRotationDegrees = (
	points: SelectedOutline['points'],
): number => {
	const [tl, tr] = points;
	return getAngleDegrees(tl, tr);
};

const getRotationCursorDegrees = (
	points: SelectedOutline['points'],
	corner: SelectedOutlineRotationCorner,
) =>
	normalizeRotationCursorDegrees(
		getOutlineRotationDegrees(points) + rotationCursorBaseDegrees[corner],
	);

export const getSelectedOutlineRotationCornerInfo = (
	points: SelectedOutline['points'],
	corner: SelectedOutlineRotationCorner,
) => {
	const [tl, tr, br, bl] = points;
	const point = {
		'top-left': tl,
		'top-right': tr,
		'bottom-right': br,
		'bottom-left': bl,
	}[corner];
	const center = getOutlineCenter(points);
	const cursorDegrees = getRotationCursorDegrees(points, corner);

	return {
		center,
		cursor: getRotationCursor(cursorDegrees),
		cursorDegrees,
		point,
	};
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

type SelectedTransformOriginInfo = {
	readonly sequenceKey: string;
	readonly displayFrame: number | null;
};

const getSelectedTransformOriginInfo = (
	selectedItems: readonly TimelineSelection[],
): SelectedTransformOriginInfo | null => {
	if (selectedItems.length !== 1) {
		return null;
	}

	const [selectedItem] = selectedItems;
	if (
		selectedItem.type === 'sequence-prop' &&
		selectedItem.key === transformOriginFieldKey
	) {
		return {
			sequenceKey: getTimelineSequenceSelectionKey(selectedItem.nodePathInfo),
			displayFrame: null,
		};
	}

	if (selectedItem.type !== 'keyframe') {
		return null;
	}

	const field = parseKeyframeFieldFromNodePath(
		selectedItem.nodePathInfo.auxiliaryKeys,
	);
	if (
		field?.type !== 'sequence' ||
		field.fieldKey !== transformOriginFieldKey
	) {
		return null;
	}

	return {
		sequenceKey: getTimelineSequenceSelectionKey(selectedItem.nodePathInfo),
		displayFrame: selectedItem.frame,
	};
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

			return (
				track.sequence.showInTimeline &&
				track.nodePathInfo.auxiliaryKeys.length === 0
			);
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

		outlines.push({
			key: target.key,
			dimensions:
				element instanceof HTMLElement
					? {
							width: element.offsetWidth,
							height: element.offsetHeight,
						}
					: element instanceof SVGSVGElement
						? {
								width: element.width.baseVal.value,
								height: element.height.baseVal.value,
							}
						: null,
			points,
		});
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

		if (
			a[i].dimensions?.width !== b[i].dimensions?.width ||
			a[i].dimensions?.height !== b[i].dimensions?.height
		) {
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
	timelinePosition,
}: {
	readonly dragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly getDragOverrides: GetDragOverrides;
	readonly timelinePosition: number;
}): SelectedOutlineScaleDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			scaleFieldKey
		];
		const sourceFrame = timelinePosition - target.keyframeDisplayOffset;
		const effectiveValue = Internals.getEffectiveVisualModeValue({
			propStatus: target.propStatus,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			frame: sourceFrame,
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
			sourceFrame,
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
}): SelectedOutlineDragChange[] => {
	const changes: SelectedOutlineDragChange[] = [];

	for (const dragState of dragStates) {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			continue;
		}

		if (dragState.target.propStatus.status === 'keyframed') {
			const startValue = NoReactInternals.serializeScaleValue([
				dragState.startX,
				dragState.startY,
				dragState.startZ,
			]);
			if (value === startValue) {
				continue;
			}

			changes.push({
				type: 'keyframed',
				fileName: dragState.target.nodePath.absolutePath,
				nodePath: dragState.target.nodePath,
				fieldKey: scaleFieldKey,
				sourceFrame: dragState.sourceFrame,
				value,
				schema: dragState.target.schema,
				clientId: dragState.target.clientId,
			});
			continue;
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
			continue;
		}

		changes.push({
			type: 'static',
			fileName: dragState.target.nodePath.absolutePath,
			nodePath: dragState.target.nodePath,
			fieldKey: scaleFieldKey,
			value,
			defaultValue: dragState.defaultValue,
			schema: dragState.target.schema,
		});
	}

	return changes;
};

export const getSelectedOutlineRotationDragStates = ({
	dragTargets,
	getDragOverrides,
	timelinePosition,
}: {
	readonly dragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly getDragOverrides: GetDragOverrides;
	readonly timelinePosition: number;
}): SelectedOutlineRotationDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			rotateFieldKey
		];
		const sourceFrame = timelinePosition - target.keyframeDisplayOffset;
		const effectiveValue = Internals.getEffectiveVisualModeValue({
			propStatus: target.propStatus,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			frame: sourceFrame,
			shouldResortToDefaultValueIfUndefined: true,
		});

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			sourceFrame,
			startDegrees: parseCssRotationToDegrees(String(effectiveValue ?? '0deg')),
			target,
		};
	});
};

export const getSelectedOutlineRotationDragValues = ({
	dragStates,
	rotationDeltaDegrees,
}: {
	readonly dragStates: readonly SelectedOutlineRotationDragState[];
	readonly rotationDeltaDegrees: number;
}): Map<string, string> => {
	return new Map(
		dragStates.map((dragState) => [
			dragState.key,
			serializeCssRotation(dragState.startDegrees + rotationDeltaDegrees),
		]),
	);
};

export const getSelectedOutlineRotationDragChanges = ({
	dragStates,
	lastValues,
}: {
	readonly dragStates: readonly SelectedOutlineRotationDragState[];
	readonly lastValues: ReadonlyMap<string, string>;
}): SelectedOutlineDragChange[] => {
	const changes: SelectedOutlineDragChange[] = [];

	for (const dragState of dragStates) {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			continue;
		}

		if (dragState.target.propStatus.status === 'keyframed') {
			const startValue = serializeCssRotation(dragState.startDegrees);
			if (value === startValue) {
				continue;
			}

			changes.push({
				type: 'keyframed',
				fileName: dragState.target.nodePath.absolutePath,
				nodePath: dragState.target.nodePath,
				fieldKey: rotateFieldKey,
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
			fieldKey: rotateFieldKey,
			value,
			defaultValue: dragState.defaultValue,
			schema: dragState.target.schema,
		});
	}

	return changes;
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

const clearSelectedOutlineRotationDragOverrides = ({
	clearDragOverrides,
	dragStates,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly dragStates: readonly SelectedOutlineRotationDragState[];
}) => {
	for (const dragState of dragStates) {
		clearDragOverrides(dragState.target.nodePath);
	}
};

const parseCssRotationToRadians = (value: string): number | null => {
	const match = value
		.trim()
		.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/);
	if (!match) {
		return null;
	}

	const number = Number(match[1]);
	if (!Number.isFinite(number)) {
		return null;
	}

	if (match[2] === 'rad') {
		return number;
	}

	if (match[2] === 'turn') {
		return number * Math.PI * 2;
	}

	if (match[2] === 'grad') {
		return (number / 400) * Math.PI * 2;
	}

	return (number / 180) * Math.PI;
};

export const compensateTranslateForTransformOrigin = ({
	startTranslate,
	deltaOrigin,
	rotate,
	scale,
}: {
	readonly startTranslate: readonly [number, number];
	readonly deltaOrigin: readonly [number, number];
	readonly rotate: number;
	readonly scale: readonly [number, number];
}): readonly [number, number] => {
	const cos = Math.cos(rotate);
	const sin = Math.sin(rotate);
	const matrixA = cos * scale[0];
	const matrixB = sin * scale[0];
	const matrixC = -sin * scale[1];
	const matrixD = cos * scale[1];
	const transformedDeltaX = matrixA * deltaOrigin[0] + matrixC * deltaOrigin[1];
	const transformedDeltaY = matrixB * deltaOrigin[0] + matrixD * deltaOrigin[1];
	const compensationX = deltaOrigin[0] - transformedDeltaX;
	const compensationY = deltaOrigin[1] - transformedDeltaY;

	return [startTranslate[0] - compensationX, startTranslate[1] - compensationY];
};

const uvsEqual = (
	left: readonly [number, number],
	right: readonly [number, number],
): boolean =>
	Math.abs(left[0] - right[0]) < 0.000001 &&
	Math.abs(left[1] - right[1]) < 0.000001;

const SelectedOutlineTransformOriginHandle: React.FC<{
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({outline, onDraggingChange, target}) => {
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const transformOriginDrag = target?.transformOriginDrag ?? null;

	const parsed = useMemo(
		() =>
			transformOriginDrag === null
				? null
				: parseTransformOrigin(transformOriginDrag.originValue),
		[transformOriginDrag],
	);
	const uv = useMemo(() => {
		if (parsed === null || outline.dimensions === null) {
			return null;
		}

		return parsedTransformOriginToUv({
			parsed,
			width: outline.dimensions.width,
			height: outline.dimensions.height,
		});
	}, [outline.dimensions, parsed]);
	const position = useMemo(
		() => (uv === null ? null : getUvHandlePosition(outline.points, uv)),
		[outline.points, uv],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGGElement>) => {
			if (
				event.button !== 0 ||
				transformOriginDrag === null ||
				parsed === null ||
				uv === null ||
				outline.dimensions === null
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const rotation = parseCssRotationToRadians(
				transformOriginDrag.rotateValue,
			);
			if (rotation === null) {
				return;
			}

			const {dimensions} = outline;
			if (dimensions === null) {
				return;
			}

			const [scaleX, scaleY] = NoReactInternals.parseScaleValue(
				transformOriginDrag.scaleValue,
			);
			const startTranslate = parseTranslate(transformOriginDrag.translateValue);
			const svgRect = svg.getBoundingClientRect();
			const defaultOrigin =
				transformOriginDrag.originDefault !== undefined
					? JSON.stringify(transformOriginDrag.originDefault)
					: null;
			const defaultTranslate =
				transformOriginDrag.translateDefault !== undefined
					? JSON.stringify(transformOriginDrag.translateDefault)
					: null;

			let last: {
				readonly uv: readonly [number, number];
				readonly origin: string;
				readonly translate: string;
			} | null = null;

			onDraggingChange(true);
			forceSpecificCursor('crosshair');

			const updateFromPointerEvent = (
				pointerEvent: PointerEvent | React.PointerEvent<SVGGElement>,
			) => {
				const point = {
					x: pointerEvent.clientX - svgRect.left,
					y: pointerEvent.clientY - svgRect.top,
				};
				const nextUv = getUvCoordinateForPoint(outline.points, point);
				const deltaOrigin = [
					(nextUv[0] - uv[0]) * dimensions.width,
					(nextUv[1] - uv[1]) * dimensions.height,
				] as const;
				const [nextTranslateX, nextTranslateY] =
					compensateTranslateForTransformOrigin({
						startTranslate,
						deltaOrigin,
						rotate: rotation,
						scale: [scaleX, scaleY],
					});
				const origin = serializeTransformOrigin({
					uv: nextUv,
					z: parsed.z,
				});
				const translate = serializeTranslate(nextTranslateX, nextTranslateY);
				last = {uv: nextUv, origin, translate};

				setDragOverrides(
					transformOriginDrag.nodePath,
					transformOriginFieldKey,
					transformOriginDrag.originPropStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: transformOriginDrag.originPropStatus,
								frame: transformOriginDrag.sourceFrame,
								value: origin,
							})
						: Internals.makeStaticDragOverride(origin),
				);
				setDragOverrides(
					transformOriginDrag.nodePath,
					translateFieldKey,
					transformOriginDrag.translatePropStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: transformOriginDrag.translatePropStatus,
								frame: transformOriginDrag.sourceFrame,
								value: translate,
							})
						: Internals.makeStaticDragOverride(translate),
				);
			};

			updateFromPointerEvent(event);

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				updateFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				stopForcingSpecificCursor();
				onDraggingChange(false);

				if (last === null || uvsEqual(last.uv, uv)) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const originChanged = last.origin !== transformOriginDrag.originValue;
				const translateChanged =
					last.translate !== transformOriginDrag.translateValue;
				if (!originChanged && !translateChanged) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const shouldSaveAsKeyframes =
					transformOriginDrag.originPropStatus.status === 'keyframed' ||
					transformOriginDrag.translatePropStatus.status === 'keyframed';

				const promise = shouldSaveAsKeyframes
					? callAddKeyframes({
							sequenceKeyframes: [
								originChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: transformOriginFieldKey,
											sourceFrame: transformOriginDrag.sourceFrame,
											value: last.origin,
											schema: transformOriginDrag.schema,
										}
									: null,
								translateChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: translateFieldKey,
											sourceFrame: transformOriginDrag.sourceFrame,
											value: last.translate,
											schema: transformOriginDrag.schema,
										}
									: null,
							].filter(
								NoReactInternals.truthy,
							) satisfies AddSequenceKeyframeChange[],
							effectKeyframes: [],
							setPropStatuses,
							clientId: transformOriginDrag.clientId,
						})
					: saveSequenceProps({
							changes: [
								originChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: transformOriginFieldKey,
											value: last.origin,
											defaultValue: defaultOrigin,
											schema: transformOriginDrag.schema,
										}
									: null,
								translateChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: translateFieldKey,
											value: last.translate,
											defaultValue: defaultTranslate,
											schema: transformOriginDrag.schema,
										}
									: null,
							].filter(NoReactInternals.truthy),
							setPropStatuses,
							clientId: transformOriginDrag.clientId,
							undoLabel: 'Move transform origin',
							redoLabel: 'Move transform origin back',
						});

				promise
					.catch((err) => {
						showNotification(
							`Could not save transform origin: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearDragOverrides(transformOriginDrag.nodePath);
					});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			clearDragOverrides,
			onDraggingChange,
			outline,
			parsed,
			setDragOverrides,
			setPropStatuses,
			transformOriginDrag,
			uv,
		],
	);

	if (
		transformOriginDrag === null ||
		parsed === null ||
		uv === null ||
		position === null
	) {
		return null;
	}

	return (
		<g
			pointerEvents="all"
			cursor="crosshair"
			onPointerDown={onPointerDown}
			aria-hidden="true"
		>
			<circle
				cx={position.x}
				cy={position.y}
				r={4}
				stroke={BLUE}
				fill="none"
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x - 8}
				y1={position.y}
				x2={position.x + 8}
				y2={position.y}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x}
				y1={position.y - 8}
				x2={position.x}
				y2={position.y + 8}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
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
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
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
				timelinePosition: timelinePositionRef.current,
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

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							scaleFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							scaleFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
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
								clientId: scaleDrag.clientId,
								undoLabel:
									changes.length > 1
										? 'Scale selected sequences'
										: 'Scale sequence',
								redoLabel:
									changes.length > 1
										? 'Scale selected sequences back'
										: 'Scale sequence back',
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

const svgPointToClientPoint = (
	point: OutlinePoint,
	rect: DOMRect,
): OutlinePoint => {
	return {
		x: point.x + rect.left,
		y: point.y + rect.top,
	};
};

const SelectedOutlineRotationCornerHandle: React.FC<{
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly corner: SelectedOutlineRotationCorner;
	readonly dragging: boolean;
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
	allRotationDragTargets,
	contextMenuValues,
	corner,
	dragging,
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
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
	const rotationDrag = target?.rotationDrag ?? null;
	const selected = target?.selected ?? false;
	const circleRef = useRef<SVGCircleElement>(null);
	const cornerInfo = useMemo(
		() => getSelectedOutlineRotationCornerInfo(outline.points, corner),
		[corner, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (event.button !== 0 || rotationDrag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

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
			forceSpecificCursor(cornerInfo.cursor);

			const svgRect = svg.getBoundingClientRect();
			const center = svgPointToClientPoint(cornerInfo.center, svgRect);
			const dragStates = getSelectedOutlineRotationDragStates({
				dragTargets: selected ? allRotationDragTargets : [rotationDrag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
			});
			let previousAngle = getAngleDegrees(center, {
				x: event.clientX,
				y: event.clientY,
			});
			let accumulatedDelta = 0;
			let lastValues = new Map<string, string>();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const nextAngle = getAngleDegrees(center, {
					x: moveEvent.clientX,
					y: moveEvent.clientY,
				});
				accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
					from: previousAngle,
					to: nextAngle,
				});
				previousAngle = nextAngle;
				lastValues = getSelectedOutlineRotationDragValues({
					dragStates,
					rotationDeltaDegrees: accumulatedDelta,
				});
				forceSpecificCursor(
					getRotationCursor(cornerInfo.cursorDegrees + accumulatedDelta),
				);

				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected rotation drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				stopForcingSpecificCursor();
				onDraggingChange(false);

				const changes = getSelectedOutlineRotationDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineRotationDragOverrides({
						clearDragOverrides,
						dragStates,
					});
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
								clientId: rotationDrag.clientId,
								undoLabel:
									changes.length > 1
										? 'Rotate selected sequences'
										: 'Rotate sequence',
								redoLabel:
									changes.length > 1
										? 'Rotate selected sequences back'
										: 'Rotate sequence back',
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
						clearSelectedOutlineRotationDragOverrides({
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
			allRotationDragTargets,
			clearDragOverrides,
			cornerInfo,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			rotationDrag,
			selected,
			setPropStatuses,
			setDragOverrides,
			target,
		],
	);

	if (rotationDrag === null) {
		return null;
	}

	return (
		<>
			<circle
				ref={circleRef}
				cx={cornerInfo.point.x}
				cy={cornerInfo.point.y}
				r={12}
				fill="transparent"
				stroke="transparent"
				vectorEffect="non-scaling-stroke"
				pointerEvents="all"
				cursor={cornerInfo.cursor}
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
				triggerRef={circleRef}
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

const SelectedOutlineElement: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
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
	allRotationDragTargets,
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
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
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
		const disableInteractivityDisabled = !target.sequence.showInTimeline;

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
			{
				type: 'item' as const,
				id: 'disable-outline-interactivity',
				keyHint: null,
				label: 'Disable interactivity',
				leftItem: null,
				disabled: disableInteractivityDisabled,
				onClick: () => {
					if (
						disableInteractivityDisabled ||
						previewServerState.type !== 'connected'
					) {
						return;
					}

					const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
					disableSequenceInteractivity({
						fileName: nodePath.absolutePath,
						nodePath,
						setPropStatuses,
						clientId: previewServerState.clientId,
					});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'disable-outline-interactivity',
			},
		].filter(NoReactInternals.truthy);
	}, [
		onSelect,
		previewServerState,
		setPropStatuses,
		target,
		updateResolvedStackTrace,
	]);

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
			{target?.containsSelection || hovered
				? (
						['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
					).map((corner) => (
						<SelectedOutlineRotationCornerHandle
							key={corner}
							allRotationDragTargets={allRotationDragTargets}
							contextMenuValues={emptyContextMenuValues}
							corner={corner}
							dragging={dragging}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
			<SelectedOutlineTransformOriginHandle
				outline={outline}
				onDraggingChange={onDraggingChange}
				target={target}
			/>
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
		if (!editorShowOutlines) {
			return [];
		}

		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
		const sequenceKeysContainingSelection =
			getSequenceKeysContainingSelection(selectedItems);
		const selectedEffectsBySequenceKey =
			getSelectedEffectFieldsBySequenceKey(selectedItems);
		const selectedTransformOriginInfo =
			getSelectedTransformOriginInfo(selectedItems);
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
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const propStatus = nodePropStatuses?.[translateFieldKey];
			const scaleFieldSchema = controls?.schema[scaleFieldKey];
			const scalePropStatus = nodePropStatuses?.[scaleFieldKey];
			const rotationFieldSchema = controls?.schema[rotateFieldKey];
			const rotationPropStatus = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			)?.[rotateFieldKey];
			const transformOriginFieldSchema =
				controls?.schema[transformOriginFieldKey];
			const transformOriginPropStatus =
				nodePropStatuses?.[transformOriginFieldKey];
			const canDragStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canRotationDragStatus =
				rotationPropStatus?.status === 'static' ||
				(rotationPropStatus?.status === 'keyframed' &&
					rotationPropStatus.interpolationFunction === 'interpolate');
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				canDragStatus;
			const canScaleDragStatus =
				scalePropStatus?.status === 'static' ||
				(scalePropStatus?.status === 'keyframed' &&
					scalePropStatus.interpolationFunction === 'interpolate');
			const canScaleDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				canScaleDragStatus;
			const canRotationDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				rotationFieldSchema?.type === 'rotation-css' &&
				canRotationDragStatus;
			const selectedForTransformOrigin =
				selectedTransformOriginInfo?.sequenceKey === key;
			const transformOriginSourceFrame =
				selectedTransformOriginInfo?.displayFrame === null ||
				selectedTransformOriginInfo?.displayFrame === undefined
					? timelinePosition - keyframeDisplayOffset
					: selectedTransformOriginInfo.displayFrame - keyframeDisplayOffset;
			const canTransformOriginStatus =
				transformOriginPropStatus?.status === 'static' ||
				(transformOriginPropStatus?.status === 'keyframed' &&
					transformOriginPropStatus.interpolationFunction === 'interpolate');
			const canTransformOriginTranslateStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canTransformOriginDrag =
				previewServerState.type === 'connected' &&
				selectedForTransformOrigin &&
				controls !== null &&
				transformOriginFieldSchema?.type === 'transform-origin' &&
				fieldSchema?.type === 'translate' &&
				canTransformOriginStatus &&
				canTransformOriginTranslateStatus;
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
							keyframeDisplayOffset,
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
				rotationDrag: canRotationDrag
					? {
							propStatus: rotationPropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: rotationFieldSchema.default,
							fieldSchema: rotationFieldSchema,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
						}
					: null,
				transformOriginDrag: canTransformOriginDrag
					? {
							clientId: previewServerState.clientId,
							keyframeDisplayOffset,
							nodePath,
							originDefault: transformOriginFieldSchema.default,
							originPropStatus: transformOriginPropStatus,
							originValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus: transformOriginPropStatus,
									dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
										transformOriginFieldKey
									],
									defaultValue: transformOriginFieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? transformOriginFieldSchema.default,
							),
							rotateValue: String(
								rotationPropStatus?.status === 'static' ||
									rotationPropStatus?.status === 'keyframed'
									? (Internals.getEffectiveVisualModeValue({
											propStatus: rotationPropStatus,
											dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
												rotateFieldKey
											],
											defaultValue:
												rotationFieldSchema?.type === 'rotation-css'
													? rotationFieldSchema.default
													: '0deg',
											frame: transformOriginSourceFrame,
											shouldResortToDefaultValueIfUndefined: true,
										}) ?? '0deg')
									: '0deg',
							),
							scaleValue:
								scalePropStatus?.status === 'static' ||
								scalePropStatus?.status === 'keyframed'
									? String(
											Internals.getEffectiveVisualModeValue({
												propStatus: scalePropStatus,
												dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
													scaleFieldKey
												],
												defaultValue:
													scaleFieldSchema?.type === 'scale'
														? scaleFieldSchema.default
														: 1,
												frame: transformOriginSourceFrame,
												shouldResortToDefaultValueIfUndefined: true,
											}) ?? 1,
										)
									: '1',
							schema: controls.schema,
							sourceFrame: transformOriginSourceFrame,
							translateDefault: fieldSchema.default,
							translatePropStatus: propStatus,
							translateValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus,
									dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
										translateFieldKey
									],
									defaultValue: fieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? fieldSchema.default,
							),
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
	const allRotationDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.rotationDrag !== null
				? [target.rotationDrag]
				: [],
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
					allRotationDragTargets={allRotationDragTargets}
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
