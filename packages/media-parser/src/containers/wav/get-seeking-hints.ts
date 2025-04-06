import type {WavSeekingHints} from '../../seeking-hints';
import type {MediaSectionState} from '../../state/video-section';
import type {WavFmt, WavStructure} from './types';

export const getSeekingInfoFromWav = ({
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
		mediaSections: mediaSection[0],
	};
};
