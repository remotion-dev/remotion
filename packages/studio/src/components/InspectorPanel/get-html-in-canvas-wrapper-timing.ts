import type {SequencePropsSubscriptionKey} from 'remotion';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineSequenceNodePathToKey} from '../../helpers/timeline-node-path-key';

export type HtmlInCanvasWrapperTiming = {
	readonly from: number;
	readonly durationInFrames: number;
	readonly trimBefore: number;
};

export const getHtmlInCanvasWrapperTiming = ({
	tracks,
	sequenceSubscriptionKey,
}: {
	readonly tracks: readonly TimelineTrackData[];
	readonly sequenceSubscriptionKey: SequencePropsSubscriptionKey;
}): HtmlInCanvasWrapperTiming | null => {
	const selectedNodePathKey = timelineSequenceNodePathToKey(
		sequenceSubscriptionKey,
	);
	const timings = tracks
		.filter(
			(candidate) =>
				candidate.nodePathInfo !== null &&
				timelineSequenceNodePathToKey(
					candidate.nodePathInfo.sequenceSubscriptionKey,
				) === selectedNodePathKey,
		)
		.map((candidate) => {
			const from = Math.max(
				0,
				candidate.localStart +
					(candidate.sequence.from - candidate.cascadedStart) *
						candidate.keyframePlaybackRate,
			);
			return {
				from,
				durationInFrames:
					candidate.sequence.duration * candidate.keyframePlaybackRate,
				trimBefore: from,
			};
		});
	const firstTiming = timings[0];
	if (
		!firstTiming ||
		!Number.isFinite(firstTiming.from) ||
		!Number.isFinite(firstTiming.durationInFrames) ||
		firstTiming.durationInFrames <= 0
	) {
		return null;
	}

	for (const candidate of timings.slice(1)) {
		if (
			!Number.isFinite(candidate.from) ||
			!Number.isFinite(candidate.durationInFrames) ||
			candidate.durationInFrames <= 0
		) {
			return null;
		}

		const fromTolerance =
			Number.EPSILON *
			Math.max(1, Math.abs(firstTiming.from), Math.abs(candidate.from)) *
			16;
		const durationTolerance =
			Number.EPSILON *
			Math.max(
				1,
				Math.abs(firstTiming.durationInFrames),
				Math.abs(candidate.durationInFrames),
			) *
			16;
		if (
			Math.abs(firstTiming.from - candidate.from) > fromTolerance ||
			Math.abs(firstTiming.durationInFrames - candidate.durationInFrames) >
				durationTolerance
		) {
			return null;
		}
	}

	return firstTiming;
};
