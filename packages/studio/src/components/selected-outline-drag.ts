import type {
	CanUpdateSequencePropStatus,
	DragOverrideValue,
	GetDragOverrides,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	clamp,
	type OutlinePoint,
	type SelectedOutline,
} from './selected-outline-geometry';
import {
	midpoint,
	vectorBetween,
	vectorLength,
} from './selected-outline-measurement';
import type {
	SelectedOutlineCropDragTarget,
	SelectedOutlineCropFieldKey,
	SelectedOutlineCropHandle,
	SelectedOutlineDragState,
	SelectedOutlineDragTarget,
	SelectedOutlineRotationDragState,
	SelectedOutlineRotationDragTarget,
	SelectedOutlineScaleDragState,
	SelectedOutlineScaleDragTarget,
	SelectedOutlineTarget,
	SelectedOutlineTransformOriginDragTarget,
} from './selected-outline-types';
import {
	cropFieldKeys,
	rotateFieldKey,
	scaleFieldKey,
	selectedOutlineDragThresholdPx,
	transformOriginFieldKey,
	translateFieldKey,
} from './selected-outline-types';
import {getUvHandlePosition, type UvCoordinate} from './selected-outline-uv';
import type {AddSequenceKeyframeChange} from './Timeline/call-add-keyframe';
import type {SaveSequencePropChange} from './Timeline/save-sequence-prop';
import {
	getTimelineDisplayDecimalPlaces,
	roundToDecimalPlaces,
} from './Timeline/timeline-field-utils';
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
	parseTransformOrigin,
	parsedTransformOriginToUv,
	serializeTransformOrigin,
} from './Timeline/transform-origin-utils';

export const getSelectedOutlineActiveSchema = ({
	schema,
	currentRuntimeValueDotNotation,
	dragOverrides,
	propStatus,
	frame,
}: {
	readonly schema: InteractivitySchema;
	readonly currentRuntimeValueDotNotation: Record<string, unknown>;
	readonly dragOverrides: Record<string, DragOverrideValue>;
	readonly propStatus: Record<string, CanUpdateSequencePropStatus> | undefined;
	readonly frame: number | null;
}): InteractivitySchema => {
	const {merged: valuesDotNotation} =
		Internals.computeEffectiveSchemaValuesDotNotation({
			schema,
			currentValue: currentRuntimeValueDotNotation,
			overrideValues: dragOverrides,
			propStatus,
			frame,
		});

	return Internals.flattenActiveSchema(schema, (key) => valuesDotNotation[key]);
};

export const getSelectedOutlineDragStates = ({
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

export const isSelectedOutlineDragPastThreshold = ({
	deltaX,
	deltaY,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
}) => {
	return Math.hypot(deltaX, deltaY) >= selectedOutlineDragThresholdPx;
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
	readonly schema: InteractivitySchema;
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

export type SelectedOutlineCropValues = Record<
	SelectedOutlineCropFieldKey,
	number
>;

const getSelectedOutlineCropCenter = (
	crop: SelectedOutlineCropValues,
): UvCoordinate => [
	(crop.cropLeft + 1 - crop.cropRight) / 2,
	(crop.cropTop + 1 - crop.cropBottom) / 2,
];

export const getSelectedOutlineCropFollowingTransformOrigin = ({
	dimensions,
	initialCrop,
	nextCrop,
	transformOrigin,
}: {
	readonly dimensions: SelectedOutline['dimensions'];
	readonly initialCrop: SelectedOutlineCropValues;
	readonly nextCrop: SelectedOutlineCropValues;
	readonly transformOrigin: SelectedOutlineCropDragTarget['transformOrigin'];
}): string | null => {
	if (
		dimensions === null ||
		transformOrigin === null ||
		transformOrigin.propStatus.status !== 'static'
	) {
		return null;
	}

	const parsed = parseTransformOrigin(transformOrigin.value);
	if (parsed === null) {
		return null;
	}

	const currentOrigin = parsedTransformOriginToUv({
		parsed,
		width: dimensions.width,
		height: dimensions.height,
	});
	if (currentOrigin === null) {
		return null;
	}

	const initialCenter = getSelectedOutlineCropCenter(initialCrop);
	const originIsAbsent = transformOrigin.propStatus.codeValue === undefined;
	const originIsAtCropCenter =
		Math.abs(currentOrigin[0] - initialCenter[0]) <= 0.0001 &&
		Math.abs(currentOrigin[1] - initialCenter[1]) <= 0.0001;
	if (!originIsAbsent && !originIsAtCropCenter) {
		return null;
	}

	return serializeTransformOrigin({
		uv: getSelectedOutlineCropCenter(nextCrop),
		z: parsed.z,
	});
};

const cropHandleIncludes = (
	handle: SelectedOutlineCropHandle,
	edge: 'left' | 'right' | 'top' | 'bottom',
) => handle === edge || handle.includes(edge);

export const getSelectedOutlineCropDragValues = ({
	crop,
	dimensions,
	handle,
	uv,
}: {
	readonly crop: SelectedOutlineCropValues;
	readonly dimensions: SelectedOutline['dimensions'];
	readonly handle: SelectedOutlineCropHandle;
	readonly uv: readonly [number, number];
}): SelectedOutlineCropValues => {
	const minimumVisibleX = dimensions === null ? 0.001 : 1 / dimensions.width;
	const minimumVisibleY = dimensions === null ? 0.001 : 1 / dimensions.height;
	const roundCrop = (value: number, max: number) =>
		clamp(roundToDecimalPlaces(value, 4), 0, Math.max(0, max));
	const next = {...crop};

	if (cropHandleIncludes(handle, 'left')) {
		next.cropLeft = roundCrop(uv[0], 1 - crop.cropRight - minimumVisibleX);
	}

	if (cropHandleIncludes(handle, 'right')) {
		next.cropRight = roundCrop(1 - uv[0], 1 - crop.cropLeft - minimumVisibleX);
	}

	if (cropHandleIncludes(handle, 'top')) {
		next.cropTop = roundCrop(uv[1], 1 - crop.cropBottom - minimumVisibleY);
	}

	if (cropHandleIncludes(handle, 'bottom')) {
		next.cropBottom = roundCrop(1 - uv[1], 1 - crop.cropTop - minimumVisibleY);
	}

	return next;
};

export const getSelectedOutlineCropDragChanges = ({
	dimensions,
	target,
	values,
}: {
	readonly dimensions: SelectedOutline['dimensions'];
	readonly target: SelectedOutlineCropDragTarget;
	readonly values: SelectedOutlineCropValues;
}): SelectedOutlineDragChange[] => {
	const changes: SelectedOutlineDragChange[] = [];

	for (const fieldKey of Object.values(cropFieldKeys)) {
		const field = target.fields[fieldKey];
		const value = values[fieldKey];
		if (value === field.value) {
			continue;
		}

		if (field.propStatus.status === 'keyframed') {
			changes.push({
				type: 'keyframed',
				fileName: target.nodePath.absolutePath,
				nodePath: target.nodePath,
				fieldKey,
				sourceFrame: target.sourceFrame,
				value,
				schema: target.schema,
				clientId: target.clientId,
			});
			continue;
		}

		const defaultValue =
			field.defaultValue === undefined
				? null
				: JSON.stringify(field.defaultValue);
		const stringifiedValue = JSON.stringify(value);
		const shouldSave =
			value !== field.propStatus.codeValue &&
			!(
				defaultValue === stringifiedValue &&
				field.propStatus.codeValue === undefined
			);

		if (shouldSave) {
			changes.push({
				type: 'static',
				fileName: target.nodePath.absolutePath,
				nodePath: target.nodePath,
				fieldKey,
				value,
				defaultValue,
				schema: target.schema,
			});
		}
	}

	if (
		changes.length === 0 ||
		target.transformOrigin === null ||
		target.transformOrigin.propStatus.status !== 'static'
	) {
		return changes;
	}

	const transformOrigin = getSelectedOutlineCropFollowingTransformOrigin({
		dimensions,
		initialCrop: {
			cropLeft: target.fields.cropLeft.value,
			cropRight: target.fields.cropRight.value,
			cropTop: target.fields.cropTop.value,
			cropBottom: target.fields.cropBottom.value,
		},
		nextCrop: values,
		transformOrigin: target.transformOrigin,
	});
	if (transformOrigin === null) {
		return changes;
	}

	const transformOriginDefaultValue =
		target.transformOrigin.defaultValue === undefined
			? null
			: JSON.stringify(target.transformOrigin.defaultValue);
	const shouldSaveTransformOrigin =
		transformOrigin !== target.transformOrigin.propStatus.codeValue &&
		!(
			transformOriginDefaultValue === JSON.stringify(transformOrigin) &&
			target.transformOrigin.propStatus.codeValue === undefined
		);
	if (shouldSaveTransformOrigin) {
		changes.push({
			type: 'static',
			fileName: target.nodePath.absolutePath,
			nodePath: target.nodePath,
			fieldKey: transformOriginFieldKey,
			value: transformOrigin,
			defaultValue: transformOriginDefaultValue,
			schema: target.schema,
		});
	}

	return changes;
};

export type SelectedOutlineKeyboardNudgeDirection =
	| 'left'
	| 'right'
	| 'up'
	| 'down';

export const getSelectedOutlineKeyboardNudgeDelta = ({
	direction,
	shiftKey,
}: {
	readonly direction: SelectedOutlineKeyboardNudgeDirection;
	readonly shiftKey: boolean;
}) => {
	const increment = shiftKey ? 10 : 1;
	return direction === 'left' || direction === 'up' ? -increment : increment;
};

export const getSelectedOutlineKeyboardNudgeDeltas = ({
	deltaX,
	deltaY,
	direction,
	shiftKey,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly direction: SelectedOutlineKeyboardNudgeDirection;
	readonly shiftKey: boolean;
}) => {
	const delta = getSelectedOutlineKeyboardNudgeDelta({
		direction,
		shiftKey,
	});

	if (direction === 'left' || direction === 'right') {
		return {deltaX: deltaX + delta, deltaY};
	}

	return {deltaX, deltaY: deltaY + delta};
};

export type SelectedOutlineScaleEdge = 'top' | 'right' | 'bottom' | 'left';

type SelectedOutlineScaleEdgeInfo = {
	readonly axis: 'x' | 'y';
	readonly cursor: string;
	readonly end: OutlinePoint;
	readonly extent: number;
	readonly normal: OutlinePoint;
	readonly start: OutlinePoint;
};

const getScaleCursor = (normal: OutlinePoint): string => {
	const degrees = Math.atan2(normal.y, normal.x) * (180 / Math.PI);
	const normalizedDegrees = ((degrees % 180) + 180) % 180;
	const snappedDegrees = Math.round(normalizedDegrees / 45) * 45;

	if (snappedDegrees === 0 || snappedDegrees === 180) {
		return 'ew-resize';
	}

	if (snappedDegrees === 45) {
		return 'nwse-resize';
	}

	if (snappedDegrees === 90) {
		return 'ns-resize';
	}

	return 'nesw-resize';
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
		cursor: getScaleCursor(outward),
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
			const decimalPlaces = getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 3,
				step: dragState.target.fieldSchema.step,
			});
			const baseX = dragState.startX;
			const baseY = dragState.startY;
			const newValue = (axis === 'x' ? baseX : baseY) * scaleFactor;
			const [rawX, rawY] = dragState.target.linked
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
			const x = roundToDecimalPlaces(rawX, decimalPlaces);
			const y = roundToDecimalPlaces(rawY, decimalPlaces);

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
		dragStates.map((dragState) => {
			const decimalPlaces = getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 1,
				step: dragState.target.fieldSchema.step,
			});

			return [
				dragState.key,
				serializeCssRotation(
					dragState.startDegrees + rotationDeltaDegrees,
					decimalPlaces,
				),
			];
		}),
	);
};

export const selectedOutlineRotationSnapStepDegrees = 15;

export const snapSelectedOutlineRotationDeltaDegrees = ({
	dragStates,
	rotationDeltaDegrees,
}: {
	readonly dragStates: readonly SelectedOutlineRotationDragState[];
	readonly rotationDeltaDegrees: number;
}) => {
	const anchor = dragStates[0];
	if (anchor === undefined) {
		return rotationDeltaDegrees;
	}

	return (
		Math.round(
			(anchor.startDegrees + rotationDeltaDegrees) /
				selectedOutlineRotationSnapStepDegrees,
		) *
			selectedOutlineRotationSnapStepDegrees -
		anchor.startDegrees
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
			const decimalPlaces = getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 1,
				step: dragState.target.fieldSchema.step,
			});
			const startValue = serializeCssRotation(
				dragState.startDegrees,
				decimalPlaces,
			);
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

export const clearSelectedOutlineDragOverrides = ({
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

export const getSelectedOutlineKeyboardNudgeDirection = (
	key: string,
): SelectedOutlineKeyboardNudgeDirection | null => {
	if (key === 'ArrowLeft') {
		return 'left';
	}

	if (key === 'ArrowRight') {
		return 'right';
	}

	if (key === 'ArrowUp') {
		return 'up';
	}

	if (key === 'ArrowDown') {
		return 'down';
	}

	return null;
};

export const clearSelectedOutlineScaleDragOverrides = ({
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

export const clearSelectedOutlineRotationDragOverrides = ({
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

export const parseCssRotationToRadians = (value: string): number | null => {
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

export const getSelectedOutlineTransformOriginDragChanges = ({
	target,
	startTranslate,
	origin,
	translate,
}: {
	readonly target: SelectedOutlineTransformOriginDragTarget;
	readonly startTranslate: readonly [number, number];
	readonly origin: string;
	readonly translate: string;
}): {
	readonly staticChanges: SaveSequencePropChange[];
	readonly keyframedChanges: AddSequenceKeyframeChange[];
} => {
	const staticChanges: SaveSequencePropChange[] = [];
	const keyframedChanges: AddSequenceKeyframeChange[] = [];
	const originChanged = origin !== target.originValue;
	const translateChanged = translate !== target.translateValue;

	if (originChanged) {
		if (target.originPropStatus.status === 'keyframed') {
			keyframedChanges.push({
				fileName: target.nodePath.absolutePath,
				nodePath: target.nodePath,
				fieldKey: transformOriginFieldKey,
				sourceFrame: target.sourceFrame,
				value: origin,
				schema: target.schema,
			});
		} else {
			staticChanges.push({
				fileName: target.nodePath.absolutePath,
				nodePath: target.nodePath,
				fieldKey: transformOriginFieldKey,
				value: origin,
				defaultValue:
					target.originDefault === undefined
						? null
						: JSON.stringify(target.originDefault),
				schema: target.schema,
			});
		}
	}

	if (!translateChanged) {
		return {staticChanges, keyframedChanges};
	}

	if (target.translatePropStatus.status === 'static') {
		staticChanges.push({
			fileName: target.nodePath.absolutePath,
			nodePath: target.nodePath,
			fieldKey: translateFieldKey,
			value: translate,
			defaultValue:
				target.translateDefault === undefined
					? null
					: JSON.stringify(target.translateDefault),
			schema: target.schema,
		});
		return {staticChanges, keyframedChanges};
	}

	if (target.originPropStatus.status === 'keyframed') {
		keyframedChanges.push({
			fileName: target.nodePath.absolutePath,
			nodePath: target.nodePath,
			fieldKey: translateFieldKey,
			sourceFrame: target.sourceFrame,
			value: translate,
			schema: target.schema,
		});
		return {staticChanges, keyframedChanges};
	}

	const nextTranslate = parseTranslate(translate);
	const deltaTranslateX = nextTranslate[0] - startTranslate[0];
	const deltaTranslateY = nextTranslate[1] - startTranslate[1];
	for (const keyframe of target.translatePropStatus.keyframes) {
		const keyframeTranslate = parseTranslate(String(keyframe.value));
		keyframedChanges.push({
			fileName: target.nodePath.absolutePath,
			nodePath: target.nodePath,
			fieldKey: translateFieldKey,
			sourceFrame: keyframe.frame,
			value: serializeTranslate(
				keyframeTranslate[0] + deltaTranslateX,
				keyframeTranslate[1] + deltaTranslateY,
			),
			schema: target.schema,
		});
	}

	return {staticChanges, keyframedChanges};
};

export const uvsEqual = (
	left: readonly [number, number],
	right: readonly [number, number],
): boolean =>
	Math.abs(left[0] - right[0]) < 0.000001 &&
	Math.abs(left[1] - right[1]) < 0.000001;

export type SelectedOutlineTransformOriginLockedAxis = 'x' | 'y' | null;

export const getSelectedOutlineTransformOriginLockedAxis = ({
	axisLocked,
	dimensions,
	startUv,
	uv,
}: {
	readonly axisLocked: boolean;
	readonly dimensions: NonNullable<SelectedOutline['dimensions']>;
	readonly startUv: UvCoordinate;
	readonly uv: UvCoordinate;
}): SelectedOutlineTransformOriginLockedAxis => {
	if (!axisLocked) {
		return null;
	}

	const deltaX = (uv[0] - startUv[0]) * dimensions.width;
	const deltaY = (uv[1] - startUv[1]) * dimensions.height;
	return Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y';
};

export const applySelectedOutlineTransformOriginAxisLock = ({
	lockedAxis,
	startUv,
	uv,
}: {
	readonly lockedAxis: SelectedOutlineTransformOriginLockedAxis;
	readonly startUv: UvCoordinate;
	readonly uv: UvCoordinate;
}): UvCoordinate => {
	if (lockedAxis === 'x') {
		return [uv[0], startUv[1]];
	}

	if (lockedAxis === 'y') {
		return [startUv[0], uv[1]];
	}

	return uv;
};

const selectedOutlineUvSnapTargets = [
	[0, 0],
	[0.5, 0],
	[1, 0],
	[1, 0.5],
	[1, 1],
	[0.5, 1],
	[0, 1],
	[0, 0.5],
	[0.5, 0.5],
] as const satisfies readonly UvCoordinate[];

export const selectedOutlineUvSnapThresholdPx = 10;

export const snapSelectedOutlineUv = ({
	point,
	points,
	thresholdPx = selectedOutlineUvSnapThresholdPx,
	uv,
}: {
	readonly point: OutlinePoint;
	readonly points: SelectedOutline['points'];
	readonly thresholdPx?: number;
	readonly uv: UvCoordinate;
}): UvCoordinate => {
	let best: {
		readonly distance: number;
		readonly uv: UvCoordinate;
	} | null = null;

	for (const snapUv of selectedOutlineUvSnapTargets) {
		const snapPoint = getUvHandlePosition(points, snapUv);
		const distance = Math.hypot(point.x - snapPoint.x, point.y - snapPoint.y);
		if (distance > thresholdPx) {
			continue;
		}

		if (best === null || distance < best.distance) {
			best = {distance, uv: snapUv};
		}
	}

	return best?.uv ?? uv;
};

export const selectedOutlineTransformOriginSnapThresholdPx =
	selectedOutlineUvSnapThresholdPx;

const getCroppedOutlineUvSnapTargets = (
	crop: SelectedOutlineTarget['crop'],
): readonly UvCoordinate[] => {
	const {left, top} = crop;
	const right = 1 - crop.right;
	const bottom = 1 - crop.bottom;
	const centerX = (left + right) / 2;
	const centerY = (top + bottom) / 2;

	return [
		[left, top],
		[centerX, top],
		[right, top],
		[right, centerY],
		[right, bottom],
		[centerX, bottom],
		[left, bottom],
		[left, centerY],
		[centerX, centerY],
	];
};

export const snapSelectedOutlineTransformOriginUv = ({
	crop,
	point,
	points,
	thresholdPx,
	uv,
}: {
	readonly crop: SelectedOutlineTarget['crop'] | null;
	readonly point: OutlinePoint;
	readonly points: SelectedOutline['points'];
	readonly thresholdPx: number | null;
	readonly uv: UvCoordinate;
}): UvCoordinate => {
	const threshold =
		thresholdPx ?? selectedOutlineTransformOriginSnapThresholdPx;

	if (crop === null) {
		return snapSelectedOutlineUv({point, points, thresholdPx: threshold, uv});
	}

	let best: {
		readonly distance: number;
		readonly uv: UvCoordinate;
	} | null = null;
	const snapTargets = [
		...selectedOutlineUvSnapTargets,
		...getCroppedOutlineUvSnapTargets(crop),
	];

	for (const snapUv of snapTargets) {
		const snapPoint = getUvHandlePosition(points, snapUv);
		const distance = Math.hypot(point.x - snapPoint.x, point.y - snapPoint.y);
		if (distance > threshold) {
			continue;
		}

		if (best === null || distance < best.distance) {
			best = {distance, uv: snapUv};
		}
	}

	return best?.uv ?? uv;
};
