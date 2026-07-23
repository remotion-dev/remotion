import {
	type CanUpdateSequencePropStatus,
	type CanUpdateSequencePropsResponse,
	type InteractivitySchema,
	type InteractivitySchemaField,
} from 'remotion';
import {LINEAR_KEYFRAME_EASING} from './keyframe-easing-presets';
import {
	getKeyframeInterpolationFunction,
	isSchemaFieldKeyframable,
} from './keyframe-interpolation-function';

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

const addKeyframeToPropStatus = ({
	status,
	fieldKey,
	frame,
	value,
	schema,
}: {
	status: CanUpdateSequencePropStatus;
	fieldKey: string;
	frame: number;
	value: unknown;
	schema: InteractivitySchema | null;
}): CanUpdateSequencePropStatus => {
	if (status.status === 'keyframed') {
		const existingIndex = status.keyframes.findIndex(
			(kf) => kf.frame === frame,
		);
		if (existingIndex !== -1) {
			const updatedKeyframes = status.keyframes.map((keyframe, index) =>
				index === existingIndex ? {frame, value} : keyframe,
			);

			return {
				...status,
				keyframes: updatedKeyframes,
			};
		}

		const keyframes = [...status.keyframes, {frame, value}].sort(
			(first, second) => first.frame - second.frame,
		);
		const easing = [...status.easing];
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
				? LINEAR_KEYFRAME_EASING
				: easing[easingIndexToDuplicate];
		easing.splice(insertedKeyframeIndex, 0, easingToDuplicate);
		while (easing.length < keyframes.length - 1) {
			easing.push(LINEAR_KEYFRAME_EASING);
		}

		return {
			...status,
			keyframes,
			easing,
		};
	}

	if (status.status === 'static') {
		const staticValue = status.codeValue ?? value;

		return {
			status: 'keyframed',
			interpolationFunction: getKeyframeInterpolationFunction({
				schema,
				key: fieldKey,
				staticValue,
				newValue: value,
			}),
			keyframes: [{frame, value}],
			easing: [],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
			output: undefined,
		};
	}

	return status;
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

const getMissingPropStatus = ({
	schema,
	fieldKey,
}: {
	schema: InteractivitySchema | null;
	fieldKey: string;
}): CanUpdateSequencePropStatus => {
	const field = schema ? findFieldInSchema(schema, fieldKey) : undefined;
	if (field && field.type !== 'hidden' && field.default !== undefined) {
		return {
			status: 'static',
			codeValue: field.default,
		};
	}

	return {
		status: 'static',
		codeValue: undefined,
	};
};

export const optimisticAddSequenceKeyframe = ({
	previous,
	fieldKey,
	frame,
	value,
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	frame: number;
	value: unknown;
	schema?: InteractivitySchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	if (!isSchemaFieldKeyframable({schema: schema ?? null, key: fieldKey})) {
		return previous;
	}

	const status =
		previous.props[fieldKey] ??
		getMissingPropStatus({schema: schema ?? null, fieldKey});

	return {
		...previous,
		props: {
			...previous.props,
			[fieldKey]: addKeyframeToPropStatus({
				status,
				fieldKey,
				frame,
				value,
				schema: schema ?? null,
			}),
		},
	};
};

export const optimisticAddEffectKeyframe = ({
	previous,
	effectIndex,
	fieldKey,
	frame,
	value,
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	frame: number;
	value: unknown;
	schema?: InteractivitySchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	if (!isSchemaFieldKeyframable({schema: schema ?? null, key: fieldKey})) {
		return previous;
	}

	const targetIndex = previous.effects.findIndex(
		(e) => e.effectIndex === effectIndex,
	);
	if (targetIndex === -1) {
		return previous;
	}

	const target = previous.effects[targetIndex];
	if (!target.canUpdate) {
		return previous;
	}

	const status =
		target.props[fieldKey] ??
		getMissingPropStatus({schema: schema ?? null, fieldKey});

	const updatedEffect = {
		...target,
		props: {
			...target.props,
			[fieldKey]: addKeyframeToPropStatus({
				status,
				fieldKey,
				frame,
				value,
				schema: schema ?? null,
			}),
		},
	};

	const effects = [...previous.effects];
	effects[targetIndex] = updatedEffect;

	return {
		...previous,
		effects,
	};
};
