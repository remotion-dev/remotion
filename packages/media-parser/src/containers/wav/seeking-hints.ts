import type {WavSeekingHints} from '../../seeking-hints';
import type {ParserState} from '../../state/parser-state';
import type {MediaSectionState} from '../../state/video-section';
import type {WavFmt, WavStructure} from './types';

export const getSeekingHintsFromWav = ({
	structure,
	mediaSectionState,
}: {
	structure: WavStructure;
	mediaSectionState: MediaSectionState;
}): WavSeekingHints | null => {
	const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt') as
		| WavFmt
		| undefined;

	if (!fmtBox) {
		return null;
	}

	const mediaSection = mediaSectionState.getMediaSections();
	if (mediaSection.length !== 1) {
		return null;
	}

	return {
		type: 'wav-seeking-hints',
		sampleRate: fmtBox.sampleRate,
		blockAlign: fmtBox.blockAlign,
		mediaSection: mediaSection[0],
	};
};

export const setSeekingHintsForWav = ({
	hints,
	state,
}: {
	hints: WavSeekingHints;
	state: ParserState;
}) => {
	// abstaining from setting fmt box, usually it is at the very beginning
	state.mediaSection.addMediaSection(hints.mediaSection);
};
