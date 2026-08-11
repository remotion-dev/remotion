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
		const nextKeyframe = keyframes[index + 1];
		if (!nextKeyframe) {
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
