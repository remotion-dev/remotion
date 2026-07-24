import type {getTimelineKeyframes} from './get-timeline-keyframes';

export type TimelineEasingSegment = {
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly segmentIndex: number;
};

export const getVisibleTimelineEasingSegment = ({
	fromFrame,
	toFrame,
	durationInFrames,
}: {
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly durationInFrames: number;
}): Pick<TimelineEasingSegment, 'fromFrame' | 'toFrame'> | null => {
	const visibleFromFrame = Math.max(0, fromFrame);
	const visibleToFrame = Math.min(durationInFrames - 1, toFrame);

	if (visibleFromFrame >= visibleToFrame) {
		return null;
	}

	return {
		fromFrame: visibleFromFrame,
		toFrame: visibleToFrame,
	};
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
