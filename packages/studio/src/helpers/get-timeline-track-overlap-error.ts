import {getTimelineNaturalMediaDuration} from './get-timeline-natural-media-duration';
import type {TimelineTrackData} from './get-timeline-sequence-sort-key';
import {isVideoWithLastFrameHold} from './is-video-with-last-frame-hold';
import type {MediaMetadata} from './use-media-metadata';

export const getTimelineTrackOverlapError = (
	timeline: readonly TimelineTrackData[],
	durationInFrames: number,
	fps: number,
	mediaMetadata: ReadonlyMap<string, MediaMetadata | null>,
): Error | null => {
	const tracks = new Map<
		string,
		{sequence: TimelineTrackData['sequence']; from: number; end: number}[]
	>();
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
			const track = tracks.get(sequence.timelineTrack.id);
			if (!track) {
				continue;
			}

			let duration = sequence.loopDisplay
				? sequence.loopDisplay.durationInFrames *
					sequence.loopDisplay.numberOfTimes
				: sequence.duration;
			if (
				(sequence.type === 'audio' || sequence.type === 'video') &&
				!sequence.loopDisplay &&
				!isVideoWithLastFrameHold(sequence)
			) {
				const naturalDuration = getTimelineNaturalMediaDuration({
					sequence,
					sequenceFrameOffset: item.sequenceFrameOffset,
					mediaMetadata: mediaMetadata.get(sequence.src) ?? null,
					fps,
				});
				// Unresolved media has no visible bar yet. Validate it when its
				// metadata arrives, using the same duration cap as the bar.
				if (naturalDuration === null) {
					continue;
				}

				duration = Math.min(duration, naturalDuration);
			}

			const from = sequence.from + (sequence.loopDisplay?.startOffset ?? 0);
			const end = Math.min(durationInFrames, from + duration);
			if (end > from) {
				track.push({sequence, from, end});
			}
		}
	}

	for (const items of tracks.values()) {
		items.sort((a, b) => a.from - b.from);
		for (let index = 1; index < items.length; index++) {
			const previous = items[index - 1];
			const current = items[index];
			const previousEnd = previous.end;
			const currentEnd = current.end;
			const overlapEnd = Math.min(previousEnd, currentEnd);
			const overlap = overlapEnd - current.from;
			const tolerance =
				Number.EPSILON *
				Math.max(1, Math.abs(overlapEnd), Math.abs(current.from)) *
				4;
			if (overlap > tolerance) {
				return new Error(
					`<Track name="${current.sequence.timelineTrack?.name}"> contains overlapping items: "${previous.sequence.displayName}" (frames ${previous.from}–${previousEnd}) and "${current.sequence.displayName}" (frames ${current.from}–${currentEnd}) overlap by ${overlap} frames, from frame ${current.from} up to frame ${overlapEnd} (exclusive). Items in a <Track> must not overlap in Studio. Shorten the earlier item's durationInFrames, move the later item's from, or put the items on separate Tracks. Use <Series> or <TransitionSeries> for overlaps managed by a series.`,
				);
			}
		}
	}

	return null;
};
