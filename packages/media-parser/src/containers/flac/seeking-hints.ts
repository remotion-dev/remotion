import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {FlacState} from '../../state/flac-state';
import type {ParserState} from '../../state/parser-state';
import type {MediaSection, MediaSectionState} from '../../state/video-section';

export type FlacSeekingHints = {
	type: 'flac-seeking-hints';
	audioSampleMap: AudioSampleOffset[];
	blockingBitStrategy: number | null;
	mediaSection: MediaSection;
};

export const getSeekingHintsForFlac = ({
	flacState,
	mediaSectionState,
}: {
	flacState: FlacState;
	mediaSectionState: MediaSectionState;
}): FlacSeekingHints => {
	return {
		type: 'flac-seeking-hints',
		audioSampleMap: flacState.audioSamples.getSamples(),
		blockingBitStrategy: flacState.getBlockingBitStrategy() ?? null,
		mediaSection: mediaSectionState.getMediaSections()[0],
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
