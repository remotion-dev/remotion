import type {AacState} from '../../state/aac-state';
import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {ParserState} from '../../state/parser-state';
import type {SamplesObservedState} from '../../state/samples-observed/slow-duration-fps';

export type AacSeekingHints = {
	type: 'aac-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	lastSampleObserved: boolean;
};

export const getSeekingHintsForAac = ({
	aacState,
	samplesObserved,
}: {
	aacState: AacState;
	samplesObserved: SamplesObservedState;
}): AacSeekingHints => {
	return {
		type: 'aac-seeking-hints',
		audioSampleMap: aacState.audioSamples.getSamples(),
		lastSampleObserved: samplesObserved.getLastSampleObserved(),
	};
};

export const setSeekingHintsForAac = ({
	hints,
	state,
}: {
	hints: AacSeekingHints;
	state: ParserState;
}) => {
	state.aac.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
