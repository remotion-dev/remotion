import type {CanUpdateSequencePropStatus} from 'remotion';

export const getTimelineKeyframes = (
	propStatus: CanUpdateSequencePropStatus | null | undefined,
	keyframeDisplayOffset = 0,
	keyframePlaybackRate = 1,
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
		keyframePlaybackRate,
	});
	if (resolvedKeyframeDisplayOffset === 0 && keyframePlaybackRate === 1) {
		return keyframes;
	}

	return keyframes.map((keyframe) => ({
		...keyframe,
		frame:
			keyframe.frame / keyframePlaybackRate + resolvedKeyframeDisplayOffset,
	}));
};

export const getKeyframeDisplayOffset = ({
	propStatus,
	keyframeDisplayOffset,
	keyframePlaybackRate,
}: {
	propStatus: CanUpdateSequencePropStatus | null | undefined;
	keyframeDisplayOffset: number;
	keyframePlaybackRate: number;
}): number => {
	return (
		keyframeDisplayOffset +
		(propStatus?.status === 'keyframed' || propStatus?.status === 'static'
			? propStatus.keyframeDisplayOffsetAdjustment === null
				? 0
				: propStatus.keyframeDisplayOffsetAdjustment / keyframePlaybackRate
			: 0)
	);
};
