import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {shouldShowTrackInTimeline} from './should-show-track-in-timeline';

export const getTimelineMatchingDuration = ({
	currentDuration,
	timeline,
}: {
	readonly currentDuration: number;
	readonly timeline: TimelineTrackData[];
}): number | null => {
	const tracksById = new Map(
		timeline.map((track) => [track.sequence.id, track]),
	);
	const endById = new Map<string, number>();
	const indefinitelyRepeatedById = new Map<string, boolean>();

	const isIndefinitelyRepeated = (track: TimelineTrackData): boolean => {
		const cached = indefinitelyRepeatedById.get(track.sequence.id);
		if (cached !== undefined) {
			return cached;
		}

		const parent = track.sequence.parent
			? tracksById.get(track.sequence.parent)
			: null;
		const isIndefinitelyRepeatedTrack =
			(track.sequence.loopDisplay !== undefined &&
				track.sequence.unclippedDuration === Infinity) ||
			(parent ? isIndefinitelyRepeated(parent) : false);
		indefinitelyRepeatedById.set(
			track.sequence.id,
			isIndefinitelyRepeatedTrack,
		);
		return isIndefinitelyRepeatedTrack;
	};

	const getUnclippedEnd = (track: TimelineTrackData): number => {
		const cached = endById.get(track.sequence.id);
		if (cached !== undefined) {
			return cached;
		}

		const parent = track.sequence.parent
			? tracksById.get(track.sequence.parent)
			: null;
		const parentEnd = parent ? getUnclippedEnd(parent) : null;
		const ownEnd = isIndefinitelyRepeated(track)
			? Infinity
			: track.cascadedStart +
				(track.sequence.loopDisplay?.startOffset ?? 0) +
				(track.sequence.unclippedDuration ?? track.sequence.duration);
		const end = parentEnd === null ? ownEnd : Math.min(ownEnd, parentEnd);
		endById.set(track.sequence.id, end);
		return end;
	};

	let longestEnd: number | null = null;
	for (const track of timeline) {
		if (!shouldShowTrackInTimeline(track, currentDuration)) {
			continue;
		}

		const end = getUnclippedEnd(track);
		if (!Number.isFinite(end) || end <= 0) {
			continue;
		}

		longestEnd = Math.max(longestEnd ?? 0, end);
	}

	return longestEnd === null ? null : Math.max(1, Math.ceil(longestEnd));
};
