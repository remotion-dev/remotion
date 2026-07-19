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
