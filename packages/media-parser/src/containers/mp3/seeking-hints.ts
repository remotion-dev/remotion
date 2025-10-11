import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {Mp3BitrateInfo, Mp3Info, Mp3State} from '../../state/mp3';
import type {ParserState} from '../../state/parser-state';
import type {SamplesObservedState} from '../../state/samples-observed/slow-duration-fps';
import type {MediaSection, MediaSectionState} from '../../state/video-section';

export type Mp3SeekingHints = {
	type: 'mp3-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	lastSampleObserved: boolean;
	mp3BitrateInfo: Mp3BitrateInfo | null;
	mp3Info: Mp3Info | null;
	mediaSection: MediaSection | null;
	contentLength: number;
};

export const getSeekingHintsForMp3 = ({
	mp3State,
	samplesObserved,
	mediaSectionState,
	contentLength,
}: {
	mp3State: Mp3State;
	mediaSectionState: MediaSectionState;
	samplesObserved: SamplesObservedState;
	contentLength: number;
}): Mp3SeekingHints => {
	return {
		type: 'mp3-seeking-hints',
		audioSampleMap: mp3State.audioSamples.getSamples(),
		lastSampleObserved: samplesObserved.getLastSampleObserved(),
		mp3BitrateInfo: mp3State.getMp3BitrateInfo(),
		mp3Info: mp3State.getMp3Info(),
		mediaSection: mediaSectionState.getMediaSections()[0] ?? null,
		contentLength,
	};
};

// TODO: could set xing data in the hints
export const setSeekingHintsForMp3 = ({
	hints,
	state,
}: {
	hints: Mp3SeekingHints;
	state: ParserState;
}) => {
	state.mp3.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
