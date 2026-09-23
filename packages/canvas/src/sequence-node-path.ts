import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';

export type CanvasSequenceNodePathResolver = (
	track: TimelineTrackData,
	index: number,
) => SequenceNodePathInfo | null;

/** Resolve a source identity when available, otherwise use the mounted instance. */
export const getCanvasSequenceNodePathInfo = (
	track: TimelineTrackData,
): SequenceNodePathInfo => {
	return (
		track.nodePathInfo ?? {
			sequenceSubscriptionKey: {
				absolutePath: 'remotion-canvas',
				nodePath: ['sequence', track.sequence.id],
				sequenceKeys: [],
				effectKeys: [],
				videoConfigValues: null,
			},
			auxiliaryKeys: [],
			index: 0,
			numberOfSequencesWithThisNodePath: 1,
			supportsEffects: track.sequence.controls?.supportsEffects === true,
		}
	);
};
