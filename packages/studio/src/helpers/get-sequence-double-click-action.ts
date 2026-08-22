import type {TSequence} from 'remotion';

export type SequenceDoubleClickAction =
	| 'open-connected-composition'
	| 'open-in-editor';

export const getSequenceDoubleClickAction = ({
	button,
	canOpenInEditor,
	numberOfConnectedCompositions,
	sequenceWasDragged,
}: {
	readonly button: number;
	readonly canOpenInEditor: boolean;
	readonly numberOfConnectedCompositions: number;
	readonly sequenceWasDragged: boolean;
}): SequenceDoubleClickAction | null => {
	// The browser still fires `dblclick` when the second press of a
	// double-click turned into a drag. That gesture is a drag, not a
	// double-click.
	if (sequenceWasDragged) {
		return null;
	}

	if (button !== 0) {
		return null;
	}

	if (numberOfConnectedCompositions === 1) {
		return 'open-connected-composition';
	}

	return canOpenInEditor ? 'open-in-editor' : null;
};

export const getConnectedCompositionFrame = ({
	timelinePosition,
	sequence,
	sequenceFrameOffset,
}: {
	readonly timelinePosition: number;
	readonly sequence: TSequence;
	readonly sequenceFrameOffset: number;
}): number | null => {
	const relativeFrame = timelinePosition - sequence.from;
	if (relativeFrame < 0 || relativeFrame >= sequence.duration) {
		return null;
	}

	return sequence.frozenFrame ?? relativeFrame + sequenceFrameOffset;
};
