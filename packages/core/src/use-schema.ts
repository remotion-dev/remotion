import {findPropsToDelete} from './find-props-to-delete.js';
import {
	getEffectiveVisualModeValue,
	resolveDragOverrideValue,
} from './get-effective-visual-mode-value.js';
import {interpolateKeyframedStatus} from './interpolate-keyframed-status.js';
import type {ExtrapolateType} from './interpolate.js';
import type {
	SequenceFieldSchema,
	SequenceSchema,
} from './sequence-field-schema.js';
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

export type CanUpdateSequencePropStatusEasing =
	| 'linear'
	| [number, number, number, number];

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
	codeValue: unknown;
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
export type CodeValues = Record<string, CanUpdateSequencePropsResponse>;

export type GetCodeValues = (
	nodePath: SequencePropsSubscriptionKey,
) => Record<string, CanUpdateSequencePropStatus> | undefined;

export type GetEffectCodeValues = (
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
	while (easing.length < keyframes.length - 1) {
		easing.push('linear');
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
	schema: SequenceSchema,
	key: string,
): SequenceFieldSchema | undefined => {
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
	schema: SequenceSchema;
	currentValue: Record<string, unknown>;
	overrideValues: Record<string, DragOverrideValue>;
	propStatus: Record<string, CanUpdateSequencePropStatus> | undefined;
	frame: number | null;
}): {merged: Record<string, unknown>; propsToDelete: Set<string>} => {
	const merged: Record<string, unknown> = {};
	const propsToDelete = new Set<string>();
	for (const key of Object.keys(currentValue)) {
		const codeValueStatus = propStatus?.[key] ?? null;
		const field = findFieldInSchema(schema, key);

		if (field?.type === 'hidden') {
			continue;
		}

		let value: unknown;
		if (codeValueStatus === null) {
			value = currentValue[key];
		} else if (isKeyframedStatus(codeValueStatus)) {
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
						frame,
						status: codeValueStatus,
					});
					value = interpolated ?? currentValue[key];
				} else {
					value = currentValue[key];
				}
			}
		} else if (codeValueStatus.status === 'computed') {
			value = currentValue[key];
		} else {
			value = getEffectiveVisualModeValue({
				codeValue: codeValueStatus,
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
