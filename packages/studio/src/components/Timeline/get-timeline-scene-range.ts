import type {TSequence} from 'remotion';
import type {TimelineSceneRange} from './timeline-series-layout';

export const getTimelineSceneRange = ({
	sequence,
	previous,
	next,
	range,
	seriesItems,
}: {
	readonly sequence: TSequence;
	readonly previous: TSequence | null;
	readonly next: TSequence | null;
	readonly range: TimelineSceneRange | null;
	readonly seriesItems: readonly TSequence[];
}): TimelineSceneRange => {
	const sceneEnd = sequence.from + sequence.duration;
	const previousEnd = previous
		? previous.from + previous.duration
		: sequence.from;
	const incomingOverlap =
		sequence.timelineTrack?.role === 'clip' &&
		previousEnd > sequence.from &&
		seriesItems.some(
			(item) =>
				item.timelineTrack?.role === 'transition' &&
				item.from === sequence.from,
		);
	const outgoingOverlap =
		sequence.timelineTrack?.role === 'clip' &&
		next !== null &&
		next.from < sceneEnd &&
		seriesItems.some(
			(item) =>
				item.timelineTrack?.role === 'transition' && item.from === next.from,
		);

	return {
		from: Math.max(
			range?.from ?? -Infinity,
			incomingOverlap ? (sequence.from + previousEnd) / 2 : sequence.from,
		),
		end: Math.min(
			range?.end ?? Infinity,
			outgoingOverlap ? (next.from + sceneEnd) / 2 : sceneEnd,
		),
		fadeInEnd: incomingOverlap
			? Math.max(range?.fadeInEnd ?? -Infinity, previousEnd)
			: (range?.fadeInEnd ?? null),
		fadeOutStart: outgoingOverlap
			? Math.min(range?.fadeOutStart ?? Infinity, next.from)
			: (range?.fadeOutStart ?? null),
	};
};
