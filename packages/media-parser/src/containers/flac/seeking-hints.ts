import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {FlacState} from '../../state/flac-state';
import type {ParserState} from '../../state/parser-state';
import type {SamplesObservedState} from '../../state/samples-observed/slow-duration-fps';

export type FlacSeekingHints = {
	type: 'flac-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	blockingBitStrategy: number | null;
	lastSampleObserved: boolean;
};

export const getSeekingHintsForFlac = ({
	flacState,
	samplesObserved,
}: {
	flacState: FlacState;
	samplesObserved: SamplesObservedState;
}): FlacSeekingHints => {
	return {
		type: 'flac-seeking-hints',
		audioSampleMap: flacState.audioSamples.getSamples(),
		blockingBitStrategy: flacState.getBlockingBitStrategy() ?? null,
		lastSampleObserved: samplesObserved.getLastSampleObserved(),
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
