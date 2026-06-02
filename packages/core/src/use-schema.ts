import {findPropsToDelete} from './find-props-to-delete.js';
import {getEffectiveVisualModeValue} from './get-effective-visual-mode-value.js';
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

export type CanUpdaterSequencePropStatusStatic = {
	canUpdate: true;
	codeValue: unknown;
	keyframed: false;
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
	| 'interpolateColors'
	| 'interpolateTranslate';

export type CanUpdateSequencePropStatusComputed = {
	canUpdate: false;
	reason: 'computed';
};

export type CanUpdateSequencePropStatusKeyframed = {
	canUpdate: true;
	codeValue: unknown;
	keyframed: true;
	interpolationFunction: CanUpdateSequencePropStatusInterpolationFunction;
	keyframes: CanUpdateSequencePropStatusKeyframe[];
	easing: CanUpdateSequencePropStatusEasing[];
	clamping: CanUpdateSequencePropStatusClamping;
	posterize: number | undefined;
};

export type CanUpdateSequencePropStatusFalse =
	CanUpdateSequencePropStatusComputed;

export type CanUpdateSequencePropStatus =
	| CanUpdaterSequencePropStatusStatic
	| CanUpdateSequencePropStatusKeyframed
	| CanUpdateSequencePropStatusFalse;

export type DragOverrides = Record<string, Record<string, unknown>>;
export type EffectDragOverrides = Record<string, Record<string, unknown>>;
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
) => Record<string, unknown>;

export const isKeyframedStatus = (
	status: CanUpdateSequencePropStatus | null,
): status is CanUpdateSequencePropStatusKeyframed => {
	return status !== null && status.canUpdate && 'keyframes' in status;
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
	overrideValues: Record<string, unknown>;
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
			if (frame !== null) {
				const interpolated = interpolateKeyframedStatus({
					frame,
					status: codeValueStatus,
				});
				value = interpolated ?? currentValue[key];
			} else {
				value = currentValue[key];
			}
		} else if (codeValueStatus.canUpdate === false) {
			value = currentValue[key];
		} else {
			value = getEffectiveVisualModeValue({
				codeValue: codeValueStatus,
				dragOverrideValue: overrideValues[key],
				defaultValue: field?.default,
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
