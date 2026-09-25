import {Internals} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';

export type CanvasSequenceNodePathResolver = (
	track: TimelineTrackData,
	index: number,
) => SequenceNodePathInfo | null;

export type CanvasSequenceSourceLocation = {
	/** The file the JSX element was compiled from. */
	fileName: string;
	/** 1-based line of the JSX element. */
	line: number;
	/** 0-based column of the JSX element, matching `getJsxNodes()` from @remotion/codemods. */
	column: number;
};

/**
 * Where the sequence's JSX element was written, if the bundler recorded it.
 * Reads the mounted sequence's current stack, so call it again after a
 * Fast Refresh update to observe moved elements.
 */
export const getCanvasSequenceSourceLocation = (
	track: TimelineTrackData,
): CanvasSequenceSourceLocation | null => {
	const location = Internals.parseOriginalSourceStack(
		track.sequence.getStack(),
	);
	if (!location) {
		return null;
	}

	return {
		fileName: location.fileName,
		line: location.line,
		column: Math.max(0, location.column - 1),
	};
};

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
