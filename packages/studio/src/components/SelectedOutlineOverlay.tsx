import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CodeValues,
	GetEffectDragOverrides,
	OverrideIdToNodePaths,
	SequenceFieldSchema,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLUE} from '../helpers/colors';
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {showNotification} from './Notifications/NotificationCenter';
import {saveEffectProp} from './Timeline/save-effect-prop';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {getDecimalPlaces} from './Timeline/timeline-field-utils';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {
	ENABLE_OUTLINES,
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
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

type SelectedOutlineUvHandle = {
	readonly clientId: string;
	readonly codeValue: Extract<CanUpdateSequencePropStatus, {canUpdate: true}>;
	readonly effectIndex: number;
	readonly fieldDefault: UvCoordinate | undefined;
	readonly fieldKey: string;
	readonly fieldSchema: UvCoordinateFieldSchema;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
	readonly value: UvCoordinate;
};

type SelectedOutlineTarget = {
	readonly key: string;
	readonly ref: React.RefObject<HTMLElement | null>;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

type SelectedOutlineDragTarget = {
	readonly codeValue: Extract<CanUpdateSequencePropStatus, {canUpdate: true}>;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
};

export type SelectedOutlineDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly startX: number;
	readonly startY: number;
	readonly target: SelectedOutlineDragTarget;
};

type SequenceWithSelectedOutline = {
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

const translateFieldKey = 'style.translate';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

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

const getSequencesWithSelectedOutlines = ({
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): SequenceWithSelectedOutline[] => {
	const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);

	if (selectedSequenceKeys.size === 0) {
		return [];
	}

	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return selectedSequenceKeys.has(
				getTimelineSequenceSelectionKey(track.nodePathInfo),
			);
		})
		.filter((track) => track.sequence.refForOutline !== null)
		.map((track) => {
			if (track.nodePathInfo === null) {
				throw new Error('Expected selected outline to have a node path');
			}

			return {
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
			const dragOverride = dragOverrides[key];
			if (dragOverride !== undefined) {
				return dragOverride;
			}

			const propStatus = effectStatus.props[key];
			if (!propStatus?.canUpdate) {
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
			if (!propStatus?.canUpdate) {
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
		const effectiveValue = Internals.getEffectiveVisualModeValue({
			codeValue: target.codeValue,
			dragOverrideValue,
			defaultValue: target.fieldDefault,
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
			value !== dragState.target.codeValue.codeValue &&
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
				fieldKey: translateFieldKey,
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

const SelectedOutlinePolygon: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly outline: SelectedOutline;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({allDragTargets, outline, scale, target}) => {
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

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPolygonElement>) => {
			if (event.button !== 0 || drag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragStates = getSelectedOutlineDragStates({
				dragTargets: allDragTargets,
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

				saveSequenceProps({
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
			scale,
			setCodeValues,
			setDragOverrides,
		],
	);

	return (
		<polygon
			points={points}
			fill={drag === null ? 'none' : 'transparent'}
			stroke={BLUE}
			strokeWidth={2}
			vectorEffect="non-scaling-stroke"
			pointerEvents={drag === null ? undefined : 'all'}
			onPointerDown={drag === null ? undefined : onPointerDown}
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
	const {selectedItems} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const overlayRef = useRef<SVGSVGElement>(null);

	const selectedOutlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!ENABLE_OUTLINES) {
			return [];
		}

		const selectedEffectsBySequenceKey =
			getSelectedEffectFieldsBySequenceKey(selectedItems);
		const clientId =
			previewServerState.type === 'connected'
				? previewServerState.clientId
				: null;

		return getSequencesWithSelectedOutlines({
			selectedItems,
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).map(({key, nodePathInfo, sequence}) => {
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const {controls} = sequence;
			const fieldSchema = controls?.schema[translateFieldKey];
			const codeValue = Internals.getCodeValuesCtx(codeValues, nodePath)?.[
				translateFieldKey
			];
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				codeValue?.canUpdate === true;

			return {
				key,
				ref: sequence.refForOutline,
				drag: canDrag
					? {
							codeValue,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							nodePath,
							schema: controls.schema,
						}
					: null,
				uvHandles: getSelectedUvHandles({
					codeValues,
					clientId,
					getEffectDragOverrides,
					nodePath,
					selectedEffects: selectedEffectsBySequenceKey.get(key),
					sequence,
				}),
			};
		});
	}, [
		codeValues,
		getEffectDragOverrides,
		overrideIdToNodePathMappings,
		previewServerState,
		selectedItems,
		sequences,
	]);

	const targetsByKey = useMemo(() => {
		return new Map(
			selectedOutlineTargets.map((target) => [target.key, target]),
		);
	}, [selectedOutlineTargets]);
	const allDragTargets = useMemo(() => {
		return selectedOutlineTargets.flatMap((target) =>
			target.drag === null ? [] : [target.drag],
		);
	}, [selectedOutlineTargets]);

	useEffect(() => {
		if (selectedOutlineTargets.length === 0) {
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
					selectedOutlineTargets,
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
	}, [selectedOutlineTargets]);

	if (selectedOutlineTargets.length === 0) {
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
						outline={outline}
						scale={scale}
						target={targetsByKey.get(outline.key)}
					/>
					{targetsByKey.get(outline.key)?.uvHandles.map((handle) => (
						<SelectedUvHandleCircle
							key={`${handle.effectIndex}-${handle.fieldKey}`}
							handle={handle}
							outline={outline}
						/>
					))}
				</React.Fragment>
			))}
		</svg>
	);
};
