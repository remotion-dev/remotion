import type {TSequence} from 'remotion';

export type SequenceDoubleClickAction =
	| 'open-connected-composition'
	| 'open-in-editor';

export const getSequenceDoubleClickAction = ({
	button,
	canOpenInEditor,
	numberOfConnectedCompositions,
}: {
	readonly button: number;
	readonly canOpenInEditor: boolean;
	readonly numberOfConnectedCompositions: number;
}): SequenceDoubleClickAction | null => {
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
