import type {
	_InternalTypes,
	LoopDisplay,
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
	sequence: TSequence & {
		loopDisplay: TimelineLoopDisplay | undefined;
	};
	connectedCompositions?: readonly _InternalTypes['AnyComposition'][];
	depth: number;
	nodePathInfo: SequenceNodePathInfo | null;
	keyframeDisplayOffset: number;
	keyframePlaybackRate: number;
	sequenceFrameOffset: number;
	cascadedStart: number;
	localStart: number;
	parentVisibleStart: number;
	parentVisibleEnd: number | null;
};

export type TimelineLoopDisplay = LoopDisplay & {
	// Phase of the first visible frame within the loop, in composition frames.
	phaseOffsetInFrames: number;
	// Elapsed time from the currently registered iteration to the media's visible start.
	mediaOffsetInFrames: number;
};
