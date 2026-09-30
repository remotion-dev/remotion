import {isSchemaFieldKeyframable} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	DragOverrideValue,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import {getKeyframeLocalFrame} from './keyframe-frames';

export const normalizeFontWeightForKeyframe = (
	value: unknown,
): number | null => {
	if (value === 'normal') {
		return 400;
	}

	if (value === 'bold') {
		return 700;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) {
		return Number(value);
	}

	return null;
};

/**
 * Whether keyframes can be added to a prop: the schema field supports
 * interpolation and the source value is not computed.
 */
export const isCanvasKeyframablePropStatus = ({
	propStatus,
	schema,
	key,
}: {
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly schema: InteractivitySchema;
	readonly key: string;
}): boolean => {
	if (propStatus.status === 'computed') {
		return false;
	}

	if (propStatus.status === 'static' && propStatus.canKeyframe === false) {
		return false;
	}

	return isSchemaFieldKeyframable({schema, key});
};

/**
 * The value a prop has at a frame of its source clock, including an active
 * drag override. Static props return their code value, keyframed props the
 * interpolated value. `null` when the source has no value, e.g. a computed
 * prop or a static prop that is not set and has no default.
 */
export const getCanvasKeyframeValueAtSourceFrame = ({
	propStatus,
	sourceFrame,
	defaultValue,
	dragOverrideValue,
}: {
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly sourceFrame: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
}): unknown | null => {
	if (propStatus.status === 'computed') {
		return null;
	}

	const value = Internals.getEffectiveVisualModeValue({
		propStatus,
		dragOverrideValue,
		frame: getKeyframeLocalFrame(sourceFrame, propStatus),
		defaultValue,
		shouldResortToDefaultValueIfUndefined: true,
	});

	return value === undefined ? null : value;
};

/**
 * The value to write into a new keyframe of a prop: the current value,
 * converted to a representation that can be interpolated.
 */
export const getCanvasKeyframeValueToAdd = ({
	propStatus,
	schema,
	key,
	sourceFrame,
	defaultValue,
	dragOverrideValue,
}: {
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly sourceFrame: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
}): unknown | null => {
	const value = getCanvasKeyframeValueAtSourceFrame({
		propStatus,
		sourceFrame,
		defaultValue,
		dragOverrideValue,
	});
	if (value === null) {
		return null;
	}

	return schema[key]?.type === 'font-weight'
		? normalizeFontWeightForKeyframe(value)
		: value;
};
