import type {ParserState} from '../../state/parser-state';
import type {RiffState} from '../../state/riff';
import type {StructureState} from '../../state/structure';
import type {Idx1Entry} from './riff-box';

export type RiffSeekingHints = {
	type: 'riff-seeking-hints';
	hasIndex: boolean;
	idx1Entries: Idx1Entry[] | null;
};

export const getSeekingHintsForRiff = ({
	structureState,
	riffState,
}: {
	structureState: StructureState;
	riffState: RiffState;
}): RiffSeekingHints => {
	const structure = structureState.getRiffStructure();
	return {
		type: 'riff-seeking-hints',
		hasIndex:
			structure.boxes.find((box) => box.type === 'avih-box')?.hasIndex ?? false,
		idx1Entries: riffState.lazyIdx1.getIfAlreadyLoaded(),
	};
};

export const setSeekingHintsForRiff = ({
	hints,
	state,
}: {
	hints: RiffSeekingHints;
	state: ParserState;
}) => {
	state.riff.lazyIdx1.setFromSeekingHints(hints);
};
