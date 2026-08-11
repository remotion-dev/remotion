import type {
	_InternalTypes,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';

export type SequenceNodePathInfo = {
	sequenceSubscriptionKey: SequencePropsSubscriptionKey;
	auxiliaryKeys: string[];
	index: number;
	numberOfSequencesWithThisNodePath: number;
	supportsEffects: boolean;
};

export type TimelineTrackData = {
	sequence: TSequence;
	connectedCompositions?: readonly _InternalTypes['AnyComposition'][];
	depth: number;
	nodePathInfo: SequenceNodePathInfo | null;
	keyframeDisplayOffset: number;
	sequenceFrameOffset: number;
};

export type TimelineTrackWithOriginalTimings = TimelineTrackData & {
	cascadedStart: number;
	cascadedDuration: number;
};

export const getTimelineSequenceSortKey = (
	track: TimelineTrackData,
	tracks: TimelineTrackData[],
	nonceRanks: Map<string, number>,
): string => {
	const rank = nonceRanks.get(track.sequence.id) ?? 0;
	const id = String(rank).padStart(6, '0');
	if (!track.sequence.parent) {
		return id;
	}

	const parent = tracks.find((t) => t.sequence.id === track.sequence.parent);
	if (!parent) {
		// Due to effects and conditional `showInTimeline`, a parent
		// may not exist in the `allTracks` array.
		return id;
	}

	return `${getTimelineSequenceSortKey(parent, tracks, nonceRanks)}-${id}`;
};
