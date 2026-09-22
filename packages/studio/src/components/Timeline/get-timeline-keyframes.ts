import type {CanUpdateSequencePropStatus} from 'remotion';

// Keep display-clock inputs until the edited property is known, so resolving its
// original source keyframe accounts for rounding introduced by the full offset.
export type KeyframeSourceFrame =
	| number
	| {
			readonly displayFrame: number;
			readonly keyframeDisplayOffset: number;
			readonly keyframePlaybackRate: number;
	  };

export const getKeyframeSourceFrame = ({
	displayFrame,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	propStatus,
}: {
	displayFrame: number;
	keyframeDisplayOffset: number;
	keyframePlaybackRate: number;
	propStatus: CanUpdateSequencePropStatus | null;
}): number => {
	const sourceFrame =
		(displayFrame - keyframeDisplayOffset) * keyframePlaybackRate;
	if (propStatus?.status !== 'keyframed') {
		return sourceFrame;
	}

	// Converting a displayed keyframe back to source frames may introduce rounding
	// error. Resolve its original frame so edits keep the existing keyframe identity,
	// including when source keyframes themselves have fractional frames.
	const tolerance =
		Number.EPSILON *
		Math.max(1, Math.abs(displayFrame), Math.abs(keyframeDisplayOffset)) *
		keyframePlaybackRate *
		8;
	let closestFrame = sourceFrame;
	let closestDistance = Infinity;
	for (const keyframe of propStatus.keyframes) {
		const distance = Math.abs(keyframe.frame - sourceFrame);
		if (distance <= tolerance && distance < closestDistance) {
			closestFrame = keyframe.frame;
			closestDistance = distance;
		}
	}

	return closestFrame;
};

export const resolveKeyframeSourceFrame = (
	sourceFrame: KeyframeSourceFrame,
	propStatus: CanUpdateSequencePropStatus | null,
): number => {
	return getKeyframeSourceFrame({
		...(typeof sourceFrame === 'number'
			? {
					displayFrame: sourceFrame,
					keyframeDisplayOffset: 0,
					keyframePlaybackRate: 1,
				}
			: sourceFrame),
		propStatus,
	});
};

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
