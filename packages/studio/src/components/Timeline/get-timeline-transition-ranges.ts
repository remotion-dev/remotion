import type {TSequence} from 'remotion';

export type TimelineTransitionRange = {
	readonly id: string;
	readonly from: number;
	readonly end: number;
};

export const getTimelineTransitionRanges = (
	items: readonly TSequence[],
): TimelineTransitionRange[] => {
	return items
		.filter((item) => item.timelineTrack?.role === 'transition')
		.sort((a, b) => a.from - b.from)
		.map((transition) => ({
			id: transition.id,
			from: transition.from,
			end: transition.from + transition.duration,
		}));
};
