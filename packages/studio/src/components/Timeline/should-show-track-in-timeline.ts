import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';

// A track is shown in the timeline list when:
// - The sequence opted-in via `showInTimeline` (the default).
//   Children of a sequence with `showInTimeline: false` keep being listed
//   on their own; their depth is independently flattened by
//   `getTimelineNestedLevel` so the parent does not contribute an indent.
// - The sequence is not a merged parent (its child represents both as one row).
// - The sequence has a positive duration.
// - The sequence starts before the composition ends.
export const shouldShowTrackInTimeline = (
	track: TrackWithHash,
	durationInFrames: number,
	mergedParentIds: ReadonlySet<string> = new Set(),
): boolean => {
	if (mergedParentIds.has(track.sequence.id)) {
		return false;
	}

	if (!track.sequence.showInTimeline) {
		return false;
	}

	if (track.sequence.duration <= 0) {
		return false;
	}

	if (track.sequence.from > durationInFrames) {
		return false;
	}

	return true;
};
