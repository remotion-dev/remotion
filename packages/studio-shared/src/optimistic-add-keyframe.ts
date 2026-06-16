import {
	type CanUpdateSequencePropStatus,
	type CanUpdateSequencePropsResponse,
	type SequenceSchema,
} from 'remotion';
import {LINEAR_KEYFRAME_EASING} from './keyframe-easing-presets';
import {
	getKeyframeInterpolationFunction,
	isSchemaFieldKeyframable,
} from './keyframe-interpolation-function';

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
	schema: SequenceSchema | null;
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
		};
	}

	return status;
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
	schema?: SequenceSchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	if (!isSchemaFieldKeyframable({schema: schema ?? null, key: fieldKey})) {
		return previous;
	}

	const status = previous.props[fieldKey];
	if (!status) {
		return previous;
	}

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
	schema?: SequenceSchema;
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

	const status = target.props[fieldKey];
	if (!status) {
		return previous;
	}

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
