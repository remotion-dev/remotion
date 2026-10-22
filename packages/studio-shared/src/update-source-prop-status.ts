import type {
	CanUpdateSequencePropSource,
	CanUpdateSequencePropStatus,
	VideoConfigValues,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

// Optimistic edits change only the edited values. Keep the other expressions so
// another mounted instance can still evaluate them in its own configuration.
export const updateSourcePropStatus = ({
	source,
	videoConfigValues,
	update,
}: {
	source: CanUpdateSequencePropSource;
	videoConfigValues: VideoConfigValues | null;
	update: (status: CanUpdateSequencePropStatus) => CanUpdateSequencePropStatus;
}): CanUpdateSequencePropSource => {
	const evaluated = NoReactInternals.evaluateSourcePropStatuses(
		{value: source},
		videoConfigValues,
	).value;
	const next = update(evaluated);
	if (next === evaluated) return source;
	if (next.status === 'computed' || source.status === 'computed') return next;
	const timing = {
		keyframeDisplayOffsetAdjustment: source.keyframeDisplayOffsetAdjustment,
		...(source.keyframePlaybackRateAdjustment === undefined
			? {}
			: {
					keyframePlaybackRateAdjustment: source.keyframePlaybackRateAdjustment,
				}),
	};
	if (
		next.status !== 'keyframed' ||
		source.status !== 'keyframed' ||
		evaluated.status !== 'keyframed'
	) {
		return {...next, ...timing};
	}

	return {
		...next,
		...timing,
		keyframes: next.keyframes.map((keyframe) => {
			const index = evaluated.keyframes.findIndex(
				(original) =>
					original.frame === keyframe.frame &&
					original.frameExpression === keyframe.frameExpression,
			);
			return index === -1
				? keyframe
				: {...keyframe, frame: source.keyframes[index].frame};
		}),
	};
};
