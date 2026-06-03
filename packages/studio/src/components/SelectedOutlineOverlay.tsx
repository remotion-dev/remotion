import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	CodeValues,
	GetEffectDragOverrides,
	OverrideIdToNodePaths,
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
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {ScaleLockContext} from '../state/scale-lock';
import {showNotification} from './Notifications/NotificationCenter';
import {
	callAddEffectKeyframe,
	callAddSequenceKeyframe,
} from './Timeline/call-add-keyframe';
import {saveEffectProp} from './Timeline/save-effect-prop';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {getDecimalPlaces} from './Timeline/timeline-field-utils';
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

type OutlinePoint = {
	readonly x: number;
	readonly y: number;
};

type SelectedOutline = {
	readonly key: string;
	readonly points: readonly [
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
	];
};

type UvCoordinate = readonly [number, number];

type UvCoordinateFieldSchema = Extract<
	SequenceFieldSchema,
	{type: 'uv-coordinate'}
>;

type EditableSequencePropStatus =
	| CanUpdateSequencePropStatusStatic
	| CanUpdateSequencePropStatusKeyframed;

type SelectedOutlineUvHandle = {
	readonly clientId: string;
	readonly codeValue: EditableSequencePropStatus;
	readonly effectIndex: number;
	readonly fieldDefault: UvCoordinate | undefined;
	readonly fieldKey: string;
	readonly fieldSchema: UvCoordinateFieldSchema;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
	readonly sourceFrame: number;
	readonly value: UvCoordinate;
};

type SelectedOutlineTarget = {
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly ref: React.RefObject<HTMLElement | null>;
	readonly selected: boolean;
	readonly selection: TimelineSelection;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly scaleDrag: SelectedOutlineScaleDragTarget | null;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

type SelectedOutlineDragTarget = {
	readonly codeValue: EditableSequencePropStatus;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
	readonly sourceFrame: number;
};

type ScaleFieldSchema = Extract<SequenceFieldSchema, {type: 'scale'}>;

type SelectedOutlineScaleDragTarget = {
	readonly codeValue: EditableSequencePropStatus;
	readonly clientId: string;
	readonly fieldDefault: number | string | undefined;
	readonly fieldSchema: ScaleFieldSchema;
	readonly linked: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
	readonly sourceFrame: number;
};

export type SelectedOutlineDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly startX: number;
	readonly startY: number;
	readonly startValue: string;
	readonly target: SelectedOutlineDragTarget;
};

export type SelectedOutlineScaleDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number;
	readonly startValue: number | string;
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

const pointToString = (point: OutlinePoint) => `${point.x},${point.y}`;

const isEditableStatus = (
	status: CanUpdateSequencePropStatus | null | undefined,
): status is EditableSequencePropStatus => {
	return status?.status === 'static' || status?.status === 'keyframed';
};

const getEditableVisualModeValue = ({
	codeValue,
	defaultValue,
	dragOverrideValue,
	sourceFrame,
}: {
	readonly codeValue: EditableSequencePropStatus;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: unknown;
	readonly sourceFrame: number;
}) => {
	if (dragOverrideValue !== undefined) {
		return dragOverrideValue;
	}

	if (codeValue.status === 'keyframed') {
		return Internals.interpolateKeyframedStatus({
			frame: sourceFrame,
			status: codeValue,
		});
	}

	return Internals.getEffectiveVisualModeValue({
		codeValue,
		dragOverrideValue,
		defaultValue,
		shouldResortToDefaultValueIfUndefined: true,
	});
};

const parseUvCoordinate = (value: unknown): UvCoordinate | null => {
	if (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number' && Number.isFinite(item))
	) {
		return [value[0], value[1]];
	}

	return null;
};

const tuplesEqual = (left: unknown, right: UvCoordinate): boolean => {
	if (!Array.isArray(left) || left.length !== 2) {
		return false;
	}

	return left[0] === right[0] && left[1] === right[1];
};

const mix = (from: number, to: number, progress: number): number => {
	return from + (to - from) * progress;
};

const mixPoint = (
	from: OutlinePoint,
	to: OutlinePoint,
	progress: number,
): OutlinePoint => {
	return {
		x: mix(from.x, to.x, progress),
		y: mix(from.y, to.y, progress),
	};
};

const midpoint = (from: OutlinePoint, to: OutlinePoint): OutlinePoint => {
	return mixPoint(from, to, 0.5);
};

const dot = (left: OutlinePoint, right: OutlinePoint): number => {
	return left.x * right.x + left.y * right.y;
};

const vectorLength = (vector: OutlinePoint): number => {
	return Math.hypot(vector.x, vector.y);
};

const getBilinearUvHandlePosition = (
	points: SelectedOutline['points'],
	uv: UvCoordinate,
): OutlinePoint => {
	const [tl, tr, br, bl] = points;
	const top = mixPoint(tl, tr, uv[0]);
	const bottom = mixPoint(bl, br, uv[0]);
	return mixPoint(top, bottom, uv[1]);
};

type ProjectiveTransform = {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
	readonly g: number;
	readonly h: number;
};

const projectiveEpsilon = 0.000001;

const getProjectiveTransform = (
	points: SelectedOutline['points'],
): ProjectiveTransform | null => {
	const [tl, tr, br, bl] = points;
	const dx1 = tr.x - br.x;
	const dx2 = bl.x - br.x;
	const dx3 = tl.x - tr.x + br.x - bl.x;
	const dy1 = tr.y - br.y;
	const dy2 = bl.y - br.y;
	const dy3 = tl.y - tr.y + br.y - bl.y;

	let g = 0;
	let h = 0;
	if (Math.abs(dx3) > projectiveEpsilon || Math.abs(dy3) > projectiveEpsilon) {
		const determinant = dx1 * dy2 - dx2 * dy1;
		if (Math.abs(determinant) < projectiveEpsilon) {
			return null;
		}

		g = (dx3 * dy2 - dx2 * dy3) / determinant;
		h = (dx1 * dy3 - dx3 * dy1) / determinant;
	}

	return {
		a: tr.x - tl.x + g * tr.x,
		b: bl.x - tl.x + h * bl.x,
		c: tl.x,
		d: tr.y - tl.y + g * tr.y,
		e: bl.y - tl.y + h * bl.y,
		f: tl.y,
		g,
		h,
	};
};

const applyProjectiveTransform = (
	transform: ProjectiveTransform,
	uv: UvCoordinate,
): OutlinePoint => {
	const denominator = transform.g * uv[0] + transform.h * uv[1] + 1;
	return {
		x: (transform.a * uv[0] + transform.b * uv[1] + transform.c) / denominator,
		y: (transform.d * uv[0] + transform.e * uv[1] + transform.f) / denominator,
	};
};

export const getUvHandlePosition = (
	points: SelectedOutline['points'],
	uv: UvCoordinate,
): OutlinePoint => {
	const transform = getProjectiveTransform(points);
	return transform === null
		? getBilinearUvHandlePosition(points, uv)
		: applyProjectiveTransform(transform, uv);
};

const vectorBetween = (from: OutlinePoint, to: OutlinePoint): OutlinePoint => {
	return {x: to.x - from.x, y: to.y - from.y};
};

const getBilinearUvCoordinateForPoint = (
	points: SelectedOutline['points'],
	point: OutlinePoint,
): UvCoordinate => {
	const [tl, tr, br, bl] = points;
	let u = 0.5;
	let v = 0.5;

	for (let i = 0; i < 8; i++) {
		const current = getBilinearUvHandlePosition(points, [u, v]);
		const errorX = current.x - point.x;
		const errorY = current.y - point.y;
		if (Math.abs(errorX) + Math.abs(errorY) < 0.001) {
			break;
		}

		const du = {
			x: mix(tr.x - tl.x, br.x - bl.x, v),
			y: mix(tr.y - tl.y, br.y - bl.y, v),
		};
		const dv = vectorBetween(mixPoint(tl, tr, u), mixPoint(bl, br, u));
		const determinant = du.x * dv.y - du.y * dv.x;
		if (Math.abs(determinant) < 0.000001) {
			break;
		}

		u -= (errorX * dv.y - errorY * dv.x) / determinant;
		v -= (du.x * errorY - du.y * errorX) / determinant;
	}

	return [u, v];
};

export const getUvCoordinateForPoint = (
	points: SelectedOutline['points'],
	point: OutlinePoint,
): UvCoordinate => {
	const transform = getProjectiveTransform(points);
	if (transform === null) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const determinant =
		transform.a * (transform.e - transform.f * transform.h) -
		transform.b * (transform.d - transform.f * transform.g) +
		transform.c * (transform.d * transform.h - transform.e * transform.g);
	if (Math.abs(determinant) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const inverseA = transform.e - transform.f * transform.h;
	const inverseB = transform.c * transform.h - transform.b;
	const inverseC = transform.b * transform.f - transform.c * transform.e;
	const inverseD = transform.f * transform.g - transform.d;
	const inverseE = transform.a - transform.c * transform.g;
	const inverseF = transform.c * transform.d - transform.a * transform.f;
	const inverseG = transform.d * transform.h - transform.e * transform.g;
	const inverseH = transform.b * transform.g - transform.a * transform.h;
	const inverseI = transform.a * transform.e - transform.b * transform.d;

	const denominator = inverseG * point.x + inverseH * point.y + inverseI;
	if (Math.abs(denominator) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	return [
		(inverseA * point.x + inverseB * point.y + inverseC) / denominator,
		(inverseD * point.x + inverseE * point.y + inverseF) / denominator,
	];
};

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

const roundToStep = (value: number, step: number | undefined): number => {
	if (step === undefined || !Number.isFinite(step) || step <= 0) {
		return value;
	}

	const decimals = getDecimalPlaces(step);
	return Number((Math.round(value / step) * step).toFixed(decimals));
};

const constrainUv = (
	value: UvCoordinate,
	schema: UvCoordinateFieldSchema,
): UvCoordinate => {
	const min = schema.min ?? -Infinity;
	const max = schema.max ?? Infinity;
	return [
		clamp(roundToStep(value[0], schema.step), min, max),
		clamp(roundToStep(value[1], schema.step), min, max),
	];
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
	element: HTMLElement,
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

const getSelectedSequenceKeys = (
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

		selectedFields.allFields = true;

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

const getSelectedUvHandles = ({
	codeValues,
	clientId,
	getEffectDragOverrides,
	nodePath,
	selectedEffects,
	sequence,
	sourceFrame,
}: {
	readonly codeValues: CodeValues;
	readonly clientId: string | null;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly selectedEffects: Map<number, SelectedEffectFields> | undefined;
	readonly sequence: TSequence;
	readonly sourceFrame: number;
}): SelectedOutlineUvHandle[] => {
	if (clientId === null || selectedEffects === undefined) {
		return [];
	}

	const handles: SelectedOutlineUvHandle[] = [];

	for (const [effectIndex, selectedFields] of selectedEffects) {
		const effect = sequence.effects[effectIndex];
		if (!effect) {
			continue;
		}

		const effectStatus = Internals.getEffectCodeValuesCtx({
			codeValues,
			nodePath,
			effectIndex,
		});
		if (effectStatus.type !== 'can-update-effect') {
			continue;
		}

		const dragOverrides = getEffectDragOverrides(nodePath, effectIndex);
		const activeSchema = Internals.flattenActiveSchema(effect.schema, (key) => {
			const dragOverride = dragOverrides[key];
			if (dragOverride !== undefined) {
				return dragOverride;
			}

			const propStatus = effectStatus.props[key];
			if (!isEditableStatus(propStatus)) {
				return undefined;
			}

			return getEditableVisualModeValue({
				codeValue: propStatus,
				dragOverrideValue: undefined,
				defaultValue: undefined,
				sourceFrame,
			});
		});

		for (const [fieldKey, fieldSchema] of Object.entries(activeSchema)) {
			if (
				fieldSchema.type !== 'uv-coordinate' ||
				(!selectedFields.allFields && !selectedFields.fieldKeys.has(fieldKey))
			) {
				continue;
			}

			const propStatus = effectStatus.props[fieldKey];
			if (!isEditableStatus(propStatus)) {
				continue;
			}

			const dragOverrideValue = dragOverrides[fieldKey];
			const effectiveValue = getEditableVisualModeValue({
				codeValue: propStatus,
				dragOverrideValue,
				defaultValue: fieldSchema.default,
				sourceFrame,
			});
			const value = parseUvCoordinate(effectiveValue);
			if (value === null) {
				continue;
			}

			handles.push({
				clientId,
				codeValue: propStatus,
				effectIndex,
				fieldDefault: fieldSchema.default,
				fieldKey,
				fieldSchema,
				nodePath,
				schema: effect.schema,
				sourceFrame,
				value,
			});
		}
	}

	return handles;
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
}: {
	readonly dragTargets: readonly SelectedOutlineDragTarget[];
	readonly getDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
	) => Record<string, unknown>;
}): SelectedOutlineDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			translateFieldKey
		];
		const effectiveValue = getEditableVisualModeValue({
			codeValue: target.codeValue,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			sourceFrame: target.sourceFrame,
		});
		const [startX, startY] = parseTranslate(
			String(effectiveValue ?? '0px 0px'),
		);
		const startValue = serializeTranslate(startX, startY);

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			startX,
			startY,
			startValue,
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

export const getSelectedOutlineDragChanges = ({
	dragStates,
	lastValues,
}: {
	readonly dragStates: readonly SelectedOutlineDragState[];
	readonly lastValues: ReadonlyMap<string, string>;
}) => {
	return dragStates.flatMap((dragState) => {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			return [];
		}

		const stringifiedValue = JSON.stringify(value);
		const shouldSave =
			value !== dragState.startValue &&
			!(
				dragState.target.codeValue.status === 'static' &&
				dragState.defaultValue === stringifiedValue &&
				dragState.target.codeValue.codeValue === undefined
			);

		if (!shouldSave) {
			return [];
		}

		return [
			dragState.target.codeValue.status === 'keyframed'
				? {
						type: 'keyframed' as const,
						fileName: dragState.target.nodePath.absolutePath,
						nodePath: dragState.target.nodePath,
						fieldKey: translateFieldKey,
						value,
						sourceFrame: dragState.target.sourceFrame,
						schema: dragState.target.schema,
					}
				: {
						type: 'static' as const,
						fileName: dragState.target.nodePath.absolutePath,
						nodePath: dragState.target.nodePath,
						fieldKey: translateFieldKey,
						value,
						defaultValue: dragState.defaultValue,
						schema: dragState.target.schema,
					},
		];
	});
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
	readonly getDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
	) => Record<string, unknown>;
}): SelectedOutlineScaleDragState[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			scaleFieldKey
		];
		const effectiveValue = getEditableVisualModeValue({
			codeValue: target.codeValue,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
			sourceFrame: target.sourceFrame,
		});
		const [startX, startY, startZ] =
			NoReactInternals.parseScaleValue(effectiveValue);
		const startValue = NoReactInternals.serializeScaleValue([
			startX,
			startY,
			startZ,
		]);

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			startX,
			startY,
			startZ,
			startValue,
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
			stringifiedValue !== JSON.stringify(dragState.startValue) &&
			!(
				dragState.target.codeValue.status === 'static' &&
				dragState.defaultValue === stringifiedValue &&
				dragState.target.codeValue.codeValue === undefined
			);

		if (!shouldSave) {
			return [];
		}

		return [
			dragState.target.codeValue.status === 'keyframed'
				? {
						type: 'keyframed' as const,
						fileName: dragState.target.nodePath.absolutePath,
						nodePath: dragState.target.nodePath,
						fieldKey: scaleFieldKey,
						value,
						sourceFrame: dragState.target.sourceFrame,
						schema: dragState.target.schema,
					}
				: {
						type: 'static' as const,
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

type SelectedOutlineSequencePropChange =
	| ReturnType<typeof getSelectedOutlineDragChanges>[number]
	| ReturnType<typeof getSelectedOutlineScaleDragChanges>[number];

const saveSelectedOutlineSequenceChanges = ({
	changes,
	clientId,
	redoLabel,
	setCodeValues,
	undoLabel,
}: {
	readonly changes: readonly SelectedOutlineSequencePropChange[];
	readonly clientId: string;
	readonly redoLabel: string | null;
	readonly setCodeValues: Parameters<
		typeof saveSequenceProps
	>[0]['setCodeValues'];
	readonly undoLabel: string | null;
}) => {
	const staticChanges = changes.flatMap((change) =>
		change.type === 'static'
			? [
					{
						fileName: change.fileName,
						nodePath: change.nodePath,
						fieldKey: change.fieldKey,
						value: change.value,
						defaultValue: change.defaultValue,
						schema: change.schema,
					},
				]
			: [],
	);
	const keyframedChanges = changes.filter(
		(change) => change.type === 'keyframed',
	);

	return Promise.all([
		staticChanges.length === 0
			? Promise.resolve()
			: saveSequenceProps({
					changes: staticChanges,
					setCodeValues,
					clientId,
					undoLabel,
					redoLabel,
				}),
		...keyframedChanges.map((change) =>
			callAddSequenceKeyframe({
				fileName: change.fileName,
				nodePath: change.nodePath,
				fieldKey: change.fieldKey,
				sourceFrame: change.sourceFrame,
				value: change.value,
				schema: change.schema,
				setCodeValues,
				clientId,
			}),
		),
	]).then(() => undefined);
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
	readonly hovered: boolean;
	readonly outline: SelectedOutline;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	hovered,
	outline,
	onHoverChange,
	onSelect,
	scale,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const points = useMemo(
		() => outline.points.map(pointToString).join(' '),
		[outline.points],
	);
	const drag = target?.drag ?? null;
	const selected = target?.selected ?? false;
	const visible = selected || hovered;

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

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragStates = getSelectedOutlineDragStates({
				dragTargets: selected ? allDragTargets : [drag],
				getDragOverrides,
			});
			let lastValues = new Map<string, string>();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				lastValues = getSelectedOutlineDragValues({
					dragStates,
					deltaX: (moveEvent.clientX - startPointerX) / scale,
					deltaY: (moveEvent.clientY - startPointerY) / scale,
				});
				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected drag value to be available');
					}

					setDragOverrides(dragState.target.nodePath, translateFieldKey, value);
				}
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);

				const changes = getSelectedOutlineDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					return;
				}

				saveSelectedOutlineSequenceChanges({
					changes,
					setCodeValues,
					clientId: drag.clientId,
					undoLabel: changes.length > 1 ? 'Move selected sequences' : null,
					redoLabel: changes.length > 1 ? 'Move selected sequences back' : null,
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
						clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			allDragTargets,
			clearDragOverrides,
			drag,
			getDragOverrides,
			onSelect,
			scale,
			selected,
			setCodeValues,
			setDragOverrides,
			target,
		],
	);

	return (
		<polygon
			points={points}
			fill="transparent"
			stroke={BLUE}
			strokeOpacity={visible ? 1 : 0}
			strokeWidth={2}
			vectorEffect="non-scaling-stroke"
			pointerEvents={target === undefined ? undefined : 'all'}
			onPointerEnter={() => onHoverChange(outline.key)}
			onPointerLeave={() => onHoverChange(null)}
			onPointerDown={onPointerDown}
		/>
	);
};

const SelectedOutlineScaleEdgeLine: React.FC<{
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly edge: SelectedOutlineScaleEdge;
	readonly outline: SelectedOutline;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allScaleDragTargets,
	edge,
	outline,
	onHoverChange,
	onSelect,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const scaleDrag = target?.scaleDrag ?? null;
	const selected = target?.selected ?? false;
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

					setDragOverrides(dragState.target.nodePath, scaleFieldKey, value);
				}
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);

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

				saveSelectedOutlineSequenceChanges({
					changes,
					setCodeValues,
					clientId: scaleDrag.clientId,
					undoLabel: changes.length > 1 ? 'Scale selected sequences' : null,
					redoLabel:
						changes.length > 1 ? 'Scale selected sequences back' : null,
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
			onSelect,
			scaleDrag,
			selected,
			setCodeValues,
			setDragOverrides,
			target,
		],
	);

	if (scaleDrag === null || edgeInfo === null) {
		return null;
	}

	return (
		<line
			x1={edgeInfo.start.x}
			y1={edgeInfo.start.y}
			x2={edgeInfo.end.x}
			y2={edgeInfo.end.y}
			stroke="transparent"
			strokeWidth={12}
			vectorEffect="non-scaling-stroke"
			pointerEvents="stroke"
			cursor={edgeInfo.cursor}
			onPointerEnter={() => onHoverChange(outline.key)}
			onPointerLeave={() => onHoverChange(null)}
			onPointerDown={onPointerDown}
		/>
	);
};

const getSvgPointFromPointerEvent = ({
	event,
	rect,
}: {
	readonly event: Pick<PointerEvent, 'clientX' | 'clientY'>;
	readonly rect: DOMRect;
}): OutlinePoint => {
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	};
};

const SelectedUvHandleCircle: React.FC<{
	readonly handle: SelectedOutlineUvHandle;
	readonly outline: SelectedOutline;
}> = ({handle, outline}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setCodeValues} =
		useContext(Internals.VisualModeSettersContext);
	const position = useMemo(
		() => getUvHandlePosition(outline.points, handle.value),
		[handle.value, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (event.button !== 0) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const svgRect = svg.getBoundingClientRect();
			let lastValue: UvCoordinate | null = null;
			const defaultValue =
				handle.fieldDefault !== undefined
					? JSON.stringify(handle.fieldDefault)
					: null;

			const updateFromPointerEvent = (
				pointerEvent: PointerEvent | React.PointerEvent<SVGCircleElement>,
			) => {
				const point = getSvgPointFromPointerEvent({
					event: pointerEvent,
					rect: svgRect,
				});
				const nextValue = constrainUv(
					getUvCoordinateForPoint(outline.points, point),
					handle.fieldSchema,
				);
				lastValue = nextValue;
				setEffectDragOverrides(
					handle.nodePath,
					handle.effectIndex,
					handle.fieldKey,
					nextValue,
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

				const stringifiedValue =
					lastValue === null ? null : JSON.stringify(lastValue);
				const shouldSave =
					lastValue !== null &&
					!tuplesEqual(handle.value, lastValue) &&
					!(
						handle.codeValue.status === 'static' &&
						defaultValue === stringifiedValue &&
						handle.codeValue.codeValue === undefined
					);

				if (!shouldSave) {
					clearEffectDragOverrides(handle.nodePath, handle.effectIndex);
					return;
				}

				const savePromise =
					handle.codeValue.status === 'keyframed'
						? callAddEffectKeyframe({
								fileName: handle.nodePath.absolutePath,
								nodePath: handle.nodePath,
								effectIndex: handle.effectIndex,
								fieldKey: handle.fieldKey,
								sourceFrame: handle.sourceFrame,
								value: lastValue,
								schema: handle.schema,
								setCodeValues,
								clientId: handle.clientId,
							})
						: saveEffectProp({
								fileName: handle.nodePath.absolutePath,
								nodePath: handle.nodePath,
								effectIndex: handle.effectIndex,
								fieldKey: handle.fieldKey,
								value: lastValue,
								defaultValue,
								schema: handle.schema,
								setCodeValues,
								clientId: handle.clientId,
							});

				savePromise.finally(() => {
					clearEffectDragOverrides(handle.nodePath, handle.effectIndex);
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			clearEffectDragOverrides,
			handle,
			outline.points,
			setCodeValues,
			setEffectDragOverrides,
		],
	);

	return (
		<circle
			cx={position.x}
			cy={position.y}
			r={6}
			fill="white"
			stroke={BLUE}
			strokeWidth={2}
			vectorEffect="non-scaling-stroke"
			pointerEvents="all"
			cursor="move"
			onPointerDown={onPointerDown}
		/>
	);
};

export const SelectedOutlineOverlay: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {getScaleLockState} = useContext(ScaleLockContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const [hoveredOutlineKey, setHoveredOutlineKey] = useState<string | null>(
		null,
	);
	const overlayRef = useRef<SVGSVGElement>(null);

	const outlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!ENABLE_OUTLINES) {
			return [];
		}

		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
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
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const {controls} = sequence;
			const fieldSchema = controls?.schema[translateFieldKey];
			const codeValue = Internals.getCodeValuesCtx(codeValues, nodePath)?.[
				translateFieldKey
			];
			const scaleFieldSchema = controls?.schema[scaleFieldKey];
			const scaleCodeValue = Internals.getCodeValuesCtx(codeValues, nodePath)?.[
				scaleFieldKey
			];
			const sourceFrame = timelinePosition - keyframeDisplayOffset;
			const editableTranslateCodeValue = isEditableStatus(codeValue)
				? codeValue
				: null;
			const editableScaleCodeValue = isEditableStatus(scaleCodeValue)
				? scaleCodeValue
				: null;
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				editableTranslateCodeValue !== null;
			const canScaleDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				editableScaleCodeValue !== null;

			return {
				key,
				nodePathInfo,
				ref: sequence.refForOutline,
				selected,
				selection: {type: 'sequence', nodePathInfo},
				drag: canDrag
					? {
							codeValue: editableTranslateCodeValue,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							nodePath,
							schema: controls.schema,
							sourceFrame,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							codeValue: editableScaleCodeValue,
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
									const effectiveValue = getEditableVisualModeValue({
										codeValue: editableScaleCodeValue,
										dragOverrideValue,
										defaultValue: scaleFieldSchema.default,
										sourceFrame,
									});
									const [x, y] =
										NoReactInternals.parseScaleValue(effectiveValue);
									return x === y;
								})(),
							}),
							nodePath,
							schema: controls.schema,
							sourceFrame,
						}
					: null,
				uvHandles: selected
					? getSelectedUvHandles({
							codeValues,
							clientId,
							getEffectDragOverrides,
							nodePath,
							selectedEffects: selectedEffectsBySequenceKey.get(key),
							sequence,
							sourceFrame,
						})
					: [],
			};
		});
	}, [
		codeValues,
		getDragOverrides,
		getEffectDragOverrides,
		getScaleLockState,
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
				<React.Fragment key={outline.key}>
					<SelectedOutlinePolygon
						allDragTargets={allDragTargets}
						hovered={hoveredOutlineKey === outline.key}
						outline={outline}
						onHoverChange={setHoveredOutlineKey}
						onSelect={selectItem}
						scale={scale}
						target={targetsByKey.get(outline.key)}
					/>
					{targetsByKey.get(outline.key)?.selected ||
					hoveredOutlineKey === outline.key
						? (['top', 'right', 'bottom', 'left'] as const).map((edge) => (
								<SelectedOutlineScaleEdgeLine
									key={edge}
									allScaleDragTargets={allScaleDragTargets}
									edge={edge}
									outline={outline}
									onHoverChange={setHoveredOutlineKey}
									onSelect={selectItem}
									target={targetsByKey.get(outline.key)}
								/>
							))
						: null}
					{targetsByKey.get(outline.key)?.selected
						? targetsByKey
								.get(outline.key)
								?.uvHandles.map((handle) => (
									<SelectedUvHandleCircle
										key={`${handle.effectIndex}-${handle.fieldKey}`}
										handle={handle}
										outline={outline}
									/>
								))
						: null}
				</React.Fragment>
			))}
		</svg>
	);
};
