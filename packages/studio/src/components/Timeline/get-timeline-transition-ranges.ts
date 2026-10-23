import type {TSequence} from 'remotion';

export type TimelineTransitionRange = {
	readonly id: string;
	readonly from: number;
	readonly end: number;
};

export const getTimelineTransitionRangesByStart = (
	ranges: readonly TimelineTransitionRange[],
): ReadonlyMap<number, TimelineTransitionRange> => {
	const byStart = new Map<number, TimelineTransitionRange>();
	for (const range of ranges) {
		// Keep the first matching transition, as with an array lookup. NaN must
		// not match itself, even though Map treats NaN keys as equal.
		if (!Number.isNaN(range.from) && !byStart.has(range.from)) {
			byStart.set(range.from, range);
		}
	}

	return byStart;
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
