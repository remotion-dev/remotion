import type {StructureState} from '../../state/structure';

export type RiffSeekingHints = {
	type: 'riff-seeking-hints';
	hasIndex: boolean;
};

export const getSeekingHintsForRiff = ({
	structureState,
}: {
	structureState: StructureState;
}): RiffSeekingHints => {
	const structure = structureState.getRiffStructure();
	return {
		type: 'riff-seeking-hints',
		hasIndex:
			structure.boxes.find((box) => box.type === 'avih-box')?.hasIndex ?? false,
	};
};

export const setSeekingHintsForRiff = () => {};
