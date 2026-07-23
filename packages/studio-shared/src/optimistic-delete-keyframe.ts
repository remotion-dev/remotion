import {
	type CanUpdateSequencePropsResponse,
	type CanUpdateSequencePropStatus,
} from 'remotion';

const getEasingIndexToRemove = ({
	removedKeyframeIndex,
	keyframeCountBeforeRemoval,
}: {
	removedKeyframeIndex: number;
	keyframeCountBeforeRemoval: number;
}) => {
	if (removedKeyframeIndex === 0) {
		return 0;
	}

	if (removedKeyframeIndex === keyframeCountBeforeRemoval - 1) {
		return removedKeyframeIndex - 1;
	}

	return removedKeyframeIndex;
};

const removeKeyframeFromPropStatus = ({
	status,
	frame,
	valueWhenLastKeyframeDeleted,
}: {
	status: CanUpdateSequencePropStatus;
	frame: number;
	valueWhenLastKeyframeDeleted: unknown | null;
}): CanUpdateSequencePropStatus => {
	if (status.status !== 'keyframed') {
		return status;
	}

	const index = status.keyframes.findIndex((kf) => kf.frame === frame);
	if (index === -1) {
		return status;
	}

	const keyframes = status.keyframes.filter((_, i) => i !== index);
	if (keyframes.length === 0) {
		return {
			status: 'static',
			codeValue:
				valueWhenLastKeyframeDeleted === null
					? status.keyframes[index].value
					: valueWhenLastKeyframeDeleted,
		};
	}

	// Easing holds one segment per gap between consecutive keyframes
	// (keyframes.length - 1 entries). Drop the segment adjacent to the removed
	// keyframe so the invariant keeps holding until the server responds.
	const easing = [...status.easing];
	if (easing.length > 0) {
		const easingIndexToRemove = getEasingIndexToRemove({
			removedKeyframeIndex: index,
			keyframeCountBeforeRemoval: status.keyframes.length,
		});
		easing.splice(easingIndexToRemove, 1);
	}

	return {
		...status,
		keyframes,
		easing,
	};
};

export const optimisticDeleteSequenceKeyframe = ({
	previous,
	fieldKey,
	frame,
	valueWhenLastKeyframeDeleted,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	frame: number;
	valueWhenLastKeyframeDeleted?: unknown;
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
			[fieldKey]: removeKeyframeFromPropStatus({
				status,
				frame,
				valueWhenLastKeyframeDeleted: valueWhenLastKeyframeDeleted ?? null,
			}),
		},
	};
};

export const optimisticDeleteSequenceKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: {
		fieldKey: string;
		frame: number;
		valueWhenLastKeyframeDeleted?: unknown;
	}[];
}): CanUpdateSequencePropsResponse => {
	return keyframes.reduce(
		(current, keyframe) =>
			optimisticDeleteSequenceKeyframe({
				previous: current,
				fieldKey: keyframe.fieldKey,
				frame: keyframe.frame,
				valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
			}),
		previous,
	);
};

export const optimisticDeleteEffectKeyframe = ({
	previous,
	effectIndex,
	fieldKey,
	frame,
	valueWhenLastKeyframeDeleted,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	frame: number;
	valueWhenLastKeyframeDeleted?: unknown;
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
			[fieldKey]: removeKeyframeFromPropStatus({
				status,
				frame,
				valueWhenLastKeyframeDeleted: valueWhenLastKeyframeDeleted ?? null,
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

export const optimisticDeleteEffectKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: {
		effectIndex: number;
		fieldKey: string;
		frame: number;
		valueWhenLastKeyframeDeleted?: unknown;
	}[];
}): CanUpdateSequencePropsResponse => {
	return keyframes.reduce(
		(current, keyframe) =>
			optimisticDeleteEffectKeyframe({
				previous: current,
				effectIndex: keyframe.effectIndex,
				fieldKey: keyframe.fieldKey,
				frame: keyframe.frame,
				valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
			}),
		previous,
	);
};
