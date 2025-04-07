import type {MediaParserKeyframe} from '../../options';
import type {FlacState} from '../../state/flac-state';
import type {KeyframesState} from '../../state/keyframes';
import type {ParserState} from '../../state/parser-state';

export type FlacSeekingHints = {
	type: 'flac-seeking-hints';
	keyframes: MediaParserKeyframe[];
	blockingBitStrategy: number | null;
};

export const getSeekingHintsForFlac = ({
	keyframes,
	flacState,
}: {
	keyframes: KeyframesState;
	flacState: FlacState;
}): FlacSeekingHints => {
	return {
		type: 'flac-seeking-hints',
		keyframes: keyframes.getKeyframes(),
		blockingBitStrategy: flacState.getBlockingBitStrategy() ?? null,
	};
};

export const setSeekingHintsForFlac = ({
	hints,
	state,
}: {
	hints: FlacSeekingHints;
	state: ParserState;
}) => {
	if (hints.blockingBitStrategy !== null) {
		state.flac.setBlockingBitStrategy(hints.blockingBitStrategy);
	}

	state.keyframes.setFromSeekingHints(hints.keyframes);
};
