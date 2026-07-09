import {findPropsToDelete} from './find-props-to-delete.js';
import {
	getEffectiveVisualModeValue,
	resolveDragOverrideValue,
} from './get-effective-visual-mode-value.js';
import type {
	InteractivitySchemaField,
	InteractivitySchema,
} from './interactivity-schema.js';
import {interpolateKeyframedStatus} from './interpolate-keyframed-status.js';
import type {ExtrapolateType} from './interpolate.js';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from './SequenceManager.js';

export type CanUpdateSequencePropStatusStatic = {
	status: 'static';
	codeValue: unknown;
};

export type CanUpdateSequencePropStatusKeyframe = {
	frame: number;
	value: unknown;
};

export type CanUpdateSequencePropStatusLinearEasing = {
	type: 'linear';
};

export type CanUpdateSequencePropStatusBezierEasing = {
	type: 'bezier';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type CanUpdateSequencePropStatusSpringEasing = {
	type: 'spring';
	allowTail: boolean | null;
	damping: number;
	mass: number;
	stiffness: number;
	overshootClamping: boolean;
	durationRestThreshold: number | null;
};

export type CanUpdateSequencePropStatusEasing =
	| CanUpdateSequencePropStatusLinearEasing
	| CanUpdateSequencePropStatusBezierEasing
	| CanUpdateSequencePropStatusSpringEasing;

export const DEFAULT_LINEAR_EASING: CanUpdateSequencePropStatusLinearEasing = {
	type: 'linear',
};

const getEasingIndexToDuplicate = ({
	insertedKeyframeIndex,
	easingLength,
	keyframeCount,
}: {
	insertedKeyframeIndex: number;
	easingLength: number;
	keyframeCount: number;
}): number | null => {
	const isSplittingExistingSegment =
		insertedKeyframeIndex > 0 && insertedKeyframeIndex < keyframeCount - 1;

	if (!isSplittingExistingSegment || easingLength === 0) {
		return null;
	}

	return Math.min(insertedKeyframeIndex - 1, easingLength - 1);
};

export type CanUpdateSequencePropStatusClamping = {
	left: ExtrapolateType;
	right: ExtrapolateType;
};

export type CanUpdateSequencePropStatusInterpolationFunction =
	| 'interpolate'
	| 'interpolateColors';

export type CanUpdateSequencePropStatusComputed = {
	status: 'computed';
};

export type CanUpdateSequencePropStatusKeyframed = {
	status: 'keyframed';
	interpolationFunction: CanUpdateSequencePropStatusInterpolationFunction;
	keyframes: CanUpdateSequencePropStatusKeyframe[];
	easing: CanUpdateSequencePropStatusEasing[];
	clamping: CanUpdateSequencePropStatusClamping;
	posterize: number | undefined;
};

export type CanUpdateSequencePropStatusFalse =
	CanUpdateSequencePropStatusComputed;

export type CanUpdateSequencePropStatus =
	| CanUpdateSequencePropStatusStatic
	| CanUpdateSequencePropStatusKeyframed
	| CanUpdateSequencePropStatusFalse;

export type DragOverrideValue =
	| {
			readonly type: 'static';
			readonly value: unknown;
	  }
	| {
			readonly type: 'keyframed';
			readonly status: CanUpdateSequencePropStatusKeyframed;
	  };

export type DragOverrides = Record<string, Record<string, DragOverrideValue>>;
export type EffectDragOverrides = Record<
	string,
	Record<string, DragOverrideValue>
>;
export type PropStatuses = Record<string, CanUpdateSequencePropsResponse>;

export type GetPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
) => Record<string, CanUpdateSequencePropStatus> | undefined;

export type GetEffectPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
	effectIndex: number,
) => Record<string, CanUpdateSequencePropStatus> | undefined;

export type GetDragOverrides = (
	nodePath: SequencePropsSubscriptionKey,
) => DragOverrides[string];

export type GetEffectDragOverrides = (
	nodePath: SequencePropsSubscriptionKey,
	effectIndex: number,
) => Record<string, DragOverrideValue>;

export const makeStaticDragOverride = (value: unknown): DragOverrideValue => {
	return {type: 'static', value};
};

export const makeKeyframedDragOverride = ({
	status,
	frame,
	value,
}: {
	status: CanUpdateSequencePropStatusKeyframed;
	frame: number;
	value: unknown;
}): DragOverrideValue => {
	const existingIndex = status.keyframes.findIndex(
		(keyframe) => keyframe.frame === frame,
	);
	const keyframes =
		existingIndex === -1
			? [...status.keyframes, {frame, value}].sort(
					(first, second) => first.frame - second.frame,
				)
			: status.keyframes.map((keyframe, index) =>
					index === existingIndex ? {frame, value} : keyframe,
				);
	const easing = [...status.easing];
	if (existingIndex === -1) {
		const insertedKeyframeIndex = keyframes.findIndex(
			(keyframe) => keyframe.frame === frame,
		);
		const easingIndexToDuplicate = getEasingIndexToDuplicate({
			insertedKeyframeIndex,
			easingLength: easing.length,
			keyframeCount: keyframes.length,
		});
		const easingToDuplicate =
			easingIndexToDuplicate === null
				? DEFAULT_LINEAR_EASING
				: easing[easingIndexToDuplicate];
		easing.splice(insertedKeyframeIndex, 0, easingToDuplicate);
	}

	while (easing.length < keyframes.length - 1) {
		easing.push(DEFAULT_LINEAR_EASING);
	}

	if (easing.length > keyframes.length - 1) {
		easing.length = keyframes.length - 1;
	}

	return {
		type: 'keyframed',
		status: {
			...status,
			keyframes,
			easing,
		},
	};
};

export const getStaticDragOverrideValue = (
	dragOverrideValue: DragOverrideValue | undefined,
): unknown => {
	if (dragOverrideValue?.type !== 'static') {
		return undefined;
	}

	return dragOverrideValue.value;
};

export const isKeyframedStatus = (
	status: CanUpdateSequencePropStatus | null,
): status is CanUpdateSequencePropStatusKeyframed => {
	return status !== null && status.status === 'keyframed';
};

const findFieldInSchema = (
	schema: InteractivitySchema,
	key: string,
): InteractivitySchemaField | undefined => {
	if (key in schema) {
		return schema[key];
	}

	for (const field of Object.values(schema)) {
		if (field.type !== 'enum') {
			continue;
		}

		for (const variant of Object.values(field.variants)) {
			const found = findFieldInSchema(variant, key);
			if (found) {
				return found;
			}
		}
	}

	return undefined;
};

export const computeEffectiveSchemaValuesDotNotation = ({
	schema,
	currentValue,
	overrideValues,
	propStatus,
	frame,
}: {
	schema: InteractivitySchema;
	currentValue: Record<string, unknown>;
	overrideValues: Record<string, DragOverrideValue>;
	propStatus: Record<string, CanUpdateSequencePropStatus> | undefined;
	frame: number | null;
}): {merged: Record<string, unknown>; propsToDelete: Set<string>} => {
	const merged: Record<string, unknown> = {};
	const propsToDelete = new Set<string>();
	for (const key of Object.keys(currentValue)) {
		const status = propStatus?.[key] ?? null;
		const field = findFieldInSchema(schema, key);

		if (field?.type === 'hidden') {
			continue;
		}

		let value: unknown;
		if (status === null) {
			value = currentValue[key];
		} else if (isKeyframedStatus(status)) {
			if (field?.type === 'array' || field?.keyframable === false) {
				value = currentValue[key];
			} else {
				const dragOverride = resolveDragOverrideValue({
					dragOverrideValue: overrideValues[key],
					frame,
				});
				if (dragOverride.type === 'resolved') {
					value = dragOverride.value;
				} else if (frame !== null) {
					const interpolated = interpolateKeyframedStatus({
						forceSpringAllowTail: null,
						frame,
						status,
					});
					value = interpolated ?? currentValue[key];
				} else {
					value = currentValue[key];
				}
			}
		} else if (status.status === 'computed') {
			value = currentValue[key];
		} else {
			value = getEffectiveVisualModeValue({
				propStatus: status,
				dragOverrideValue: overrideValues[key],
				defaultValue: field?.default,
				frame,
				shouldResortToDefaultValueIfUndefined: false,
			});
		}

		if (value === undefined) {
			propsToDelete.add(key);
		}

		merged[key] = value;
	}

	for (const key of Object.keys(overrideValues)) {
		if (schema[key]?.type === 'enum') {
			const propsToDeleteForKey = findPropsToDelete({
				schema,
				key,
				value: merged[key],
			});
			for (const propToDelete of propsToDeleteForKey) {
				propsToDelete.add(propToDelete);
			}
		}
	}

	return {merged, propsToDelete};
};
