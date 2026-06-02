import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
} from 'remotion';

export const getComputedStatusLabel: (
	propStatus: CanUpdateSequencePropStatusFalse,
) => string = (propStatus) => {
	if (propStatus.reason === 'computed') {
		return 'computed';
	}

	return 'keyframed';
};

export const getTimelineKeyframes = (
	propStatus: CanUpdateSequencePropStatus | null | undefined,
	keyframeDisplayOffset = 0,
): {frame: number; value: unknown}[] => {
	if (!propStatus) {
		return [];
	}

	if (!propStatus.canUpdate) {
		return [];
	}

	if ('keyframes' in propStatus) {
		const {keyframes} = propStatus as Extract<
			CanUpdateSequencePropStatus,
			{keyframes: unknown}
		>;
		if (keyframeDisplayOffset === 0) {
			return keyframes;
		}

		return keyframes.map((keyframe) => ({
			...keyframe,
			frame: keyframe.frame + keyframeDisplayOffset,
		}));
	}

	return [];
};
