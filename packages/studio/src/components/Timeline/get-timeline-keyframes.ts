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
	if (keyframeDisplayOffset === 0) {
		return keyframes;
	}

	return keyframes.map((keyframe) => ({
		...keyframe,
		frame: keyframe.frame + keyframeDisplayOffset,
	}));
};
