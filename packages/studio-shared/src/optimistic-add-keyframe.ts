import {
	type CanUpdateSequencePropStatus,
	type CanUpdateSequencePropsResponse,
} from 'remotion';

const getInterpolationFunction = (
	staticValue: unknown,
	newValue: unknown,
): 'interpolate' | 'interpolateColors' => {
	return typeof staticValue === 'string' && typeof newValue === 'string'
		? 'interpolateColors'
		: 'interpolate';
};

const addKeyframeToPropStatus = ({
	status,
	frame,
	value,
}: {
	status: CanUpdateSequencePropStatus;
	frame: number;
	value: unknown;
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
			easing.push('linear');
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
			codeValue: undefined,
			interpolationFunction: getInterpolationFunction(staticValue, value),
			keyframes: [{frame, value}],
			easing: [],
			clamping: {left: 'extend', right: 'extend'},
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
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	frame: number;
	value: unknown;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
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
			[fieldKey]: addKeyframeToPropStatus({status, frame, value}),
		},
	};
};

export const optimisticAddEffectKeyframe = ({
	previous,
	effectIndex,
	fieldKey,
	frame,
	value,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	frame: number;
	value: unknown;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
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
			[fieldKey]: addKeyframeToPropStatus({status, frame, value}),
		},
	};

	const effects = [...previous.effects];
	effects[targetIndex] = updatedEffect;

	return {
		...previous,
		effects,
	};
};
