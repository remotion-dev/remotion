import type {TimelineTrackData} from './get-timeline-sequence-sort-key';

export const getTimelineTrackOverlapError = (
	timeline: readonly TimelineTrackData[],
	durationInFrames: number,
): Error | null => {
	const tracks = new Map<string, TimelineTrackData[]>();
	for (const {sequence} of timeline) {
		if (
			sequence.timelineTrack?.role === 'track' &&
			sequence.controls?.componentIdentity === 'dev.remotion.remotion.Track'
		) {
			tracks.set(sequence.timelineTrack.id, []);
		}
	}

	for (const item of timeline) {
		const {sequence} = item;
		if (
			sequence.timelineTrack?.role === 'clip' &&
			(sequence.showInTimeline || sequence.type !== 'sequence') &&
			sequence.duration > 0 &&
			sequence.from < durationInFrames
		) {
			tracks.get(sequence.timelineTrack.id)?.push(item);
		}
	}

	for (const items of tracks.values()) {
		items.sort((a, b) => a.sequence.from - b.sequence.from);
		for (let index = 1; index < items.length; index++) {
			const previous = items[index - 1].sequence;
			const current = items[index].sequence;
			const previousEnd = Math.min(
				durationInFrames,
				previous.from + previous.duration,
			);
			const currentEnd = Math.min(
				durationInFrames,
				current.from + current.duration,
			);
			const overlapEnd = Math.min(previousEnd, currentEnd);
			const overlap = overlapEnd - current.from;
			const tolerance =
				Number.EPSILON *
				Math.max(1, Math.abs(overlapEnd), Math.abs(current.from)) *
				4;
			if (overlap > tolerance) {
				return new Error(
					`<Track name="${current.timelineTrack?.name}"> contains overlapping items: "${previous.displayName}" (frames ${previous.from}–${previousEnd}) and "${current.displayName}" (frames ${current.from}–${currentEnd}) overlap by ${overlap} frames, from frame ${current.from} up to frame ${overlapEnd} (exclusive). Items in a <Track> must not overlap in Studio. Shorten the earlier item's durationInFrames, move the later item's from, or put the items on separate Tracks. Use <Series> or <TransitionSeries> for overlaps managed by a series.`,
				);
			}
		}
	}

	return null;
};
