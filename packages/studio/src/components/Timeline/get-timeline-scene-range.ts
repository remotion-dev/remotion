import type {TSequence} from 'remotion';
import type {TimelineTransitionRange} from './get-timeline-transition-ranges';
import type {TimelineSceneRange} from './timeline-series-layout';

export const getTimelineSceneRange = ({
	sequence,
	previous,
	next,
	range,
	transitionRangesByStart,
}: {
	readonly sequence: TSequence;
	readonly previous: TSequence | null;
	readonly next: TSequence | null;
	readonly range: TimelineSceneRange | null;
	readonly transitionRangesByStart: ReadonlyMap<
		number,
		TimelineTransitionRange
	>;
}): TimelineSceneRange => {
	const sceneEnd = sequence.from + sequence.duration;
	const previousEnd = previous
		? previous.from + previous.duration
		: sequence.from;
	const incomingTransition =
		sequence.timelineTrack?.role === 'clip' && previousEnd > sequence.from
			? transitionRangesByStart.get(sequence.from)
			: undefined;
	const outgoingTransition =
		sequence.timelineTrack?.role === 'clip' &&
		next !== null &&
		next.from < sceneEnd
			? transitionRangesByStart.get(next.from)
			: undefined;
	const from = Math.max(
		range?.from ?? -Infinity,
		sequence.from,
		incomingTransition?.from ?? -Infinity,
	);
	const end = Math.min(
		range?.end ?? Infinity,
		sceneEnd,
		outgoingTransition?.end ?? Infinity,
	);
	return {
		from,
		end,
		activeFrom: Math.max(
			range?.activeFrom ?? -Infinity,
			incomingTransition ? (sequence.from + previousEnd) / 2 : sequence.from,
		),
		activeEnd: Math.min(
			range?.activeEnd ?? Infinity,
			outgoingTransition && next ? (next.from + sceneEnd) / 2 : sceneEnd,
		),
		transitionInEnd: incomingTransition
			? Math.max(range?.transitionInEnd ?? -Infinity, incomingTransition.end)
			: (range?.transitionInEnd ?? null),
		transitionOutStart: outgoingTransition
			? Math.min(range?.transitionOutStart ?? Infinity, outgoingTransition.from)
			: (range?.transitionOutStart ?? null),
	};
};
