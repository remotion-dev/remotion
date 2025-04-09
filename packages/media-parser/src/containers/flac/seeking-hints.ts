import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {FlacState} from '../../state/flac-state';
import type {ParserState} from '../../state/parser-state';

export type FlacSeekingHints = {
	type: 'flac-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	blockingBitStrategy: number | null;
};

export const getSeekingHintsForFlac = ({
	flacState,
}: {
	flacState: FlacState;
}): FlacSeekingHints => {
	return {
		type: 'flac-seeking-hints',
		audioSampleMap: flacState.audioSamples.getSamples(),
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

	state.flac.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
