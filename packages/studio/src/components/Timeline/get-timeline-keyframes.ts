import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
} from 'remotion';

export const getComputedStatusLabel: (
	propStatus: CanUpdateSequencePropStatusFalse,
) => string = (propStatus) => {
	if (propStatus.status === 'computed') {
		return 'computed';
	}

	throw new Error(
		`Unsupported prop status: ${propStatus.status satisfies never}`,
	);
};

export const getTimelineKeyframes = (
	propStatus: CanUpdateSequencePropStatus | null | undefined,
	keyframeDisplayOffset = 0,
): {frame: number; value: unknown}[] => {
	if (!propStatus) {
		return [];
	}

	if (propStatus.status !== 'keyframed') {
		return [];
	}

	const {keyframes} = propStatus;
	const resolvedKeyframeDisplayOffset = getKeyframeDisplayOffset({
		propStatus,
		keyframeDisplayOffset,
	});
	if (resolvedKeyframeDisplayOffset === 0) {
		return keyframes;
	}

	return keyframes.map((keyframe) => ({
		...keyframe,
		frame: keyframe.frame + resolvedKeyframeDisplayOffset,
	}));
};

export const getKeyframeDisplayOffset = ({
	propStatus,
	keyframeDisplayOffset,
}: {
	propStatus: CanUpdateSequencePropStatus | null | undefined;
	keyframeDisplayOffset: number;
}): number => {
	return (
		keyframeDisplayOffset +
		(propStatus?.status === 'keyframed' || propStatus?.status === 'static'
			? (propStatus.keyframeDisplayOffsetAdjustment ?? 0)
			: 0)
	);
};
