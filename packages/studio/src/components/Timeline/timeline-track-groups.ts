import type {TSequence} from 'remotion';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';

export const TIMELINE_PACKED_TRACK_HEIGHT = 36;

export type TimelineDisplayRow = {
	readonly track: TimelineTrackWithDisplayGroup;
	readonly items: readonly TimelineTrackWithDisplayGroup[] | null;
};

export const filterTimelineTrackContents = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
	sequences: readonly TSequence[],
): TimelineTrackWithDisplayGroup[] => {
	const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));

	return tracks.flatMap((track) => {
		if (track.sequence.timelineTrack?.role === 'container') {
			return [];
		}

		let {parent} = track.sequence;
		let hiddenAncestors = 0;
		while (parent !== null) {
			const ancestor = byId.get(parent);
			if (!ancestor) {
				break;
			}

			if (ancestor.timelineTrack) {
				if (ancestor.timelineTrack.role === 'container') {
					hiddenAncestors += Number(ancestor.showInTimeline);
				} else if (!track.sequence.timelineTrack) {
					// A clip owns its internal layers. Explicit nested tracks still
					// keep their own rows.
					return [];
				}
			}

			parent = ancestor.parent;
		}

		return [{...track, depth: Math.max(0, track.depth - hiddenAncestors)}];
	});
};

export const getTimelineDisplayRows = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
): TimelineDisplayRow[] => {
	const rows: TimelineDisplayRow[] = [];
	const groupedItems = new Map<string, TimelineTrackWithDisplayGroup[]>();
	for (const track of tracks) {
		const group = track.sequence.timelineTrack;
		if (!group) {
			rows.push({track, items: null});
			continue;
		}

		const existing = groupedItems.get(group.id);
		if (existing) {
			existing.push(track);
			continue;
		}

		const items = [track];
		groupedItems.set(group.id, items);
		rows.push({track, items});
	}

	return rows;
};
