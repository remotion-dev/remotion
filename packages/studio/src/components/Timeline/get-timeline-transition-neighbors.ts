import {CanvasInternals} from '@remotion/sdk';
import type {TSequence} from 'remotion';

export const getTimelineTransitionNeighbors = ({
	sequenceId,
	sequences,
}: {
	readonly sequenceId: string;
	readonly sequences: readonly TSequence[];
}): {readonly previous: TSequence; readonly next: TSequence} | null => {
	const sequence = sequences.find((item) => item.id === sequenceId);
	if (!sequence?.timelineTrack) return null;
	const siblings = CanvasInternals.sortItemsByCommitOrder(
		sequences.filter(
			(item) =>
				item.parent === sequence.parent &&
				item.timelineTrack?.id === sequence.timelineTrack?.id &&
				(item.timelineTrack?.role === 'clip' ||
					item.timelineTrack?.role === 'transition'),
		),
		(item) => item.timelineOrder,
	);
	const index = siblings.findIndex((item) => item.id === sequenceId);
	const previousClip = siblings[index - 1];
	if (
		sequence.timelineTrack.role === 'clip' &&
		previousClip?.timelineTrack?.role === 'clip' &&
		previousClip.duration > 0 &&
		sequence.duration > 0 &&
		Math.abs(previousClip.from + previousClip.duration - sequence.from) <
			0.000001
	) {
		return {previous: previousClip, next: sequence};
	}

	const transitionIndex =
		sequence.timelineTrack.role === 'transition' ? index : index - 1;
	const previous = siblings[transitionIndex - 1];
	const next = siblings[transitionIndex + 1];
	return siblings[transitionIndex]?.timelineTrack?.role === 'transition' &&
		previous?.timelineTrack?.role === 'clip' &&
		next?.timelineTrack?.role === 'clip'
		? {previous, next}
		: null;
};
