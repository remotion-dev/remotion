import type {getTimelineKeyframes} from './get-timeline-keyframes';

export type TimelineEasingSegment = {
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly segmentIndex: number;
};

export const getTimelineEasingSegments = (
	keyframes: ReturnType<typeof getTimelineKeyframes>,
): TimelineEasingSegment[] => {
	return keyframes.flatMap((keyframe, index) => {
		if (keyframe.disabled) {
			return [];
		}

		const nextKeyframe = keyframes
			.slice(index + 1)
			.find((candidate) => !candidate.disabled);
		if (nextKeyframe === undefined) {
			return [];
		}

		return [
			{
				fromFrame: keyframe.frame,
				toFrame: nextKeyframe.frame,
				segmentIndex: index,
			},
		];
	});
};
