import {
	type CanUpdateSequencePropStatus,
	type CanUpdateSequencePropsResponse,
} from 'remotion';

const moveKeyframeInPropStatus = ({
	status,
	fromFrame,
	toFrame,
}: {
	status: CanUpdateSequencePropStatus;
	fromFrame: number;
	toFrame: number;
}): CanUpdateSequencePropStatus => {
	if (status.status !== 'keyframed' || fromFrame === toFrame) {
		return status;
	}

	const keyframeIndex = status.keyframes.findIndex(
		(keyframe) => keyframe.frame === fromFrame,
	);
	if (keyframeIndex === -1) {
		return status;
	}

	const collision = status.keyframes.some(
		(keyframe) => keyframe.frame === toFrame,
	);
	if (collision) {
		return status;
	}

	const keyframes = status.keyframes
		.map((keyframe, index) =>
			index === keyframeIndex ? {...keyframe, frame: toFrame} : keyframe,
		)
		.sort((first, second) => first.frame - second.frame);

	return {
		...status,
		keyframes,
	};
};

export const optimisticMoveSequenceKeyframe = ({
	previous,
	fieldKey,
	fromFrame,
	toFrame,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	fromFrame: number;
	toFrame: number;
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
			[fieldKey]: moveKeyframeInPropStatus({status, fromFrame, toFrame}),
		},
	};
};

export const optimisticMoveSequenceKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: {fieldKey: string; fromFrame: number; toFrame: number}[];
}): CanUpdateSequencePropsResponse => {
	return keyframes.reduce(
		(current, keyframe) =>
			optimisticMoveSequenceKeyframe({
				previous: current,
				fieldKey: keyframe.fieldKey,
				fromFrame: keyframe.fromFrame,
				toFrame: keyframe.toFrame,
			}),
		previous,
	);
};

export const optimisticMoveEffectKeyframe = ({
	previous,
	effectIndex,
	fieldKey,
	fromFrame,
	toFrame,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	fromFrame: number;
	toFrame: number;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const targetIndex = previous.effects.findIndex(
		(effect) => effect.effectIndex === effectIndex,
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
			[fieldKey]: moveKeyframeInPropStatus({status, fromFrame, toFrame}),
		},
	};

	const effects = [...previous.effects];
	effects[targetIndex] = updatedEffect;

	return {
		...previous,
		effects,
	};
};

export const optimisticMoveEffectKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: {
		effectIndex: number;
		fieldKey: string;
		fromFrame: number;
		toFrame: number;
	}[];
}): CanUpdateSequencePropsResponse => {
	return keyframes.reduce(
		(current, keyframe) =>
			optimisticMoveEffectKeyframe({
				previous: current,
				effectIndex: keyframe.effectIndex,
				fieldKey: keyframe.fieldKey,
				fromFrame: keyframe.fromFrame,
				toFrame: keyframe.toFrame,
			}),
		previous,
	);
};
