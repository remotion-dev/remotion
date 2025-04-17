import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {Mp3State} from '../../state/mp3';
import type {ParserState} from '../../state/parser-state';
import type {SamplesObservedState} from '../../state/samples-observed/slow-duration-fps';

export type Mp3SeekingHints = {
	type: 'mp3-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	lastSampleObserved: boolean;
};

export const getSeekingHintsForMp3 = ({
	mp3State,
	samplesObserved,
}: {
	mp3State: Mp3State;
	samplesObserved: SamplesObservedState;
}): Mp3SeekingHints => {
	return {
		type: 'mp3-seeking-hints',
		audioSampleMap: mp3State.audioSamples.getSamples(),
		lastSampleObserved: samplesObserved.getLastSampleObserved(),
	};
};

export const setSeekingHintsForMp3 = ({
	hints,
	state,
}: {
	hints: Mp3SeekingHints;
	state: ParserState;
}) => {
	state.mp3.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
