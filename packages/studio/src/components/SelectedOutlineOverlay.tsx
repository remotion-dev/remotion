import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	CodeValues,
	GetDragOverrides,
	GetEffectDragOverrides,
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
import {ScaleLockContext} from '../state/scale-lock';
import {ContextMenuForTarget} from './ContextMenu';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {callAddSequenceKeyframe} from './Timeline/call-add-keyframe';
import {saveEffectProp} from './Timeline/save-effect-prop';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './Timeline/save-sequence-prop';
import {getDecimalPlaces} from './Timeline/timeline-field-utils';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {getLinkedScale} from './Timeline/TimelineScaleField';
import {
	ENABLE_OUTLINES,
	getTimelineSequenceSelectionKey,
	useTimelineSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';

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

type SelectedOutlineUvHandle = {
	readonly clientId: string;
	readonly codeValue: CanUpdateSequencePropStatusStatic;
	readonly effectIndex: number;
	readonly fieldDefault: UvCoordinate | undefined;
	readonly fieldKey: string;
	readonly fieldSchema: UvCoordinateFieldSchema;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
	readonly value: UvCoordinate;
};

type UvConnectionHandle = Pick<
	SelectedOutlineUvHandle,
	'effectIndex' | 'fieldKey' | 'fieldSchema' | 'value'
>;

type UvHandleConnectionLine = {
	readonly key: string;
	readonly from: OutlinePoint;
	readonly to: OutlinePoint;
};

type SelectedOutlineContextMenuOpenResult =
	| false
	| void
	| readonly ComboboxValue[];

type SelectedOutlineContextMenuOpenHandler = () =>
	| SelectedOutlineContextMenuOpenResult
	| Promise<SelectedOutlineContextMenuOpenResult>;

type SelectedOutlineTarget = {
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly ref: React.RefObject<HTMLElement | null>;
	readonly selected: boolean;
	readonly selection: TimelineSelection;
	readonly sequence: TSequence;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly scaleDrag: SelectedOutlineScaleDragTarget | null;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

type SelectedOutlineDragTarget = {
	readonly codeValue:
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
	readonly codeValue: CanUpdateSequencePropStatusStatic;
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

export const getUvHandleConnectionLines = ({
	handles,
	points,
}: {
	readonly handles: readonly UvConnectionHandle[];
	readonly points: SelectedOutline['points'];
}): UvHandleConnectionLine[] => {
	const handlesByField = new Map(
		handles.map((handle) => [
			`${handle.effectIndex}\u0000${handle.fieldKey}`,
			handle,
		]),
	);
	const seenPairs = new Set<string>();
	const lines: UvHandleConnectionLine[] = [];

	for (const handle of handles) {
		const targetFieldKey = handle.fieldSchema.lineTo;
		if (targetFieldKey === undefined || targetFieldKey === handle.fieldKey) {
			continue;
		}

		const target = handlesByField.get(
			`${handle.effectIndex}\u0000${targetFieldKey}`,
		);
		if (target === undefined) {
			continue;
		}

		const pairKey = [
			handle.effectIndex,
			...[handle.fieldKey, targetFieldKey].sort(),
		].join('\u0000');
		if (seenPairs.has(pairKey)) {
			continue;
		}

		seenPairs.add(pairKey);
		lines.push({
			key: `${handle.effectIndex}-${handle.fieldKey}-${targetFieldKey}`,
			from: getUvHandlePosition(points, handle.value),
			to: getUvHandlePosition(points, target.value),
		});
	}

	return lines;
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
}: {
	readonly codeValues: CodeValues;
	readonly clientId: string | null;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly selectedEffects: Map<number, SelectedEffectFields> | undefined;
	readonly sequence: TSequence;
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
			const dragOverride = Internals.getStaticDragOverrideValue(
				dragOverrides[key],
			);
			if (dragOverride !== undefined) {
				return dragOverride;
			}

			const propStatus = effectStatus.props[key];
			if (propStatus?.status !== 'static') {
				return undefined;
			}

			return propStatus.codeValue;
		});

		for (const [fieldKey, fieldSchema] of Object.entries(activeSchema)) {
			if (
				fieldSchema.type !== 'uv-coordinate' ||
				(!selectedFields.allFields && !selectedFields.fieldKeys.has(fieldKey))
			) {
				continue;
			}

			const propStatus = effectStatus.props[fieldKey];
			if (propStatus?.status !== 'static') {
				continue;
			}

			const dragOverrideValue = dragOverrides[fieldKey];
			const effectiveValue = Internals.getEffectiveVisualModeValue({
				codeValue: propStatus,
				dragOverrideValue,
				defaultValue: fieldSchema.default,
				shouldResortToDefaultValueIfUndefined: true,
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
			codeValue: target.codeValue,
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

		if (dragState.target.codeValue.status === 'keyframed') {
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
			value !== dragState.target.codeValue.codeValue &&
			!(
				dragState.defaultValue === stringifiedValue &&
				dragState.target.codeValue.codeValue === undefined
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
			codeValue: target.codeValue,
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
				JSON.stringify(dragState.target.codeValue.codeValue) &&
			!(
				dragState.defaultValue === stringifiedValue &&
				dragState.target.codeValue.codeValue === undefined
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
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
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

			onDraggingChange(true);

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragStates = getSelectedOutlineDragStates({
				dragTargets: selected ? allDragTargets : [drag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
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

					if (dragState.target.codeValue.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							translateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.codeValue,
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

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
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
								setCodeValues,
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
							setCodeValues,
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
			setCodeValues,
			setDragOverrides,
			target,
		],
	);
	return (
		<>
			<polygon
				ref={polygonRef}
				points={points}
				fill="transparent"
				stroke={BLUE}
				strokeOpacity={visible ? 1 : 0}
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
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
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
					setCodeValues,
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
			setCodeValues,
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

const SelectedUvHandleConnectionLines: React.FC<{
	readonly handles: readonly SelectedOutlineUvHandle[];
	readonly outline: SelectedOutline;
}> = ({handles, outline}) => {
	const lines = useMemo(
		() => getUvHandleConnectionLines({handles, points: outline.points}),
		[handles, outline.points],
	);

	return (
		<>
			{lines.map((line) => (
				<line
					key={line.key}
					x1={line.from.x}
					y1={line.from.y}
					x2={line.to.x}
					y2={line.to.y}
					stroke={BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			))}
		</>
	);
};

const SelectedUvHandleCircle: React.FC<{
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly handle: SelectedOutlineUvHandle;
	readonly outline: SelectedOutline;
}> = ({handle, onDraggingChange, outline}) => {
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
			onDraggingChange(true);
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
					Internals.makeStaticDragOverride(nextValue),
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
				onDraggingChange(false);

				const stringifiedValue =
					lastValue === null ? null : JSON.stringify(lastValue);
				const shouldSave =
					lastValue !== null &&
					!tuplesEqual(handle.codeValue.codeValue, lastValue) &&
					!(
						defaultValue === stringifiedValue &&
						handle.codeValue.codeValue === undefined
					);

				if (!shouldSave) {
					clearEffectDragOverrides(handle.nodePath, handle.effectIndex);
					return;
				}

				saveEffectProp({
					type: 'value',
					fileName: handle.nodePath.absolutePath,
					nodePath: handle.nodePath,
					effectIndex: handle.effectIndex,
					fieldKey: handle.fieldKey,
					value: lastValue,
					defaultValue,
					schema: handle.schema,
					setCodeValues,
					clientId: handle.clientId,
				}).finally(() => {
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
			onDraggingChange,
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
			{target?.selected || hovered
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
			{target?.selected
				? (() => {
						const {uvHandles} = target;
						return (
							<>
								<SelectedUvHandleConnectionLines
									handles={uvHandles}
									outline={outline}
								/>
								{uvHandles.map((handle) => (
									<SelectedUvHandleCircle
										key={`${handle.effectIndex}-${handle.fieldKey}`}
										handle={handle}
										onDraggingChange={onDraggingChange}
										outline={outline}
									/>
								))}
							</>
						);
					})()
				: null}
		</>
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
			const canDragStatus =
				codeValue?.status === 'static' ||
				(codeValue?.status === 'keyframed' &&
					codeValue.interpolationFunction === 'interpolate');
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				canDragStatus;
			const canScaleDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				scaleCodeValue?.status === 'static';

			return {
				key,
				nodePathInfo,
				ref: sequence.refForOutline,
				selected,
				selection: {type: 'sequence', nodePathInfo},
				sequence,
				drag: canDrag
					? {
							codeValue,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							codeValue: scaleCodeValue,
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
										codeValue: scaleCodeValue,
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
				uvHandles: selected
					? getSelectedUvHandles({
							codeValues,
							clientId,
							getEffectDragOverrides,
							nodePath,
							selectedEffects: selectedEffectsBySequenceKey.get(key),
							sequence,
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
		</svg>
	);
};
