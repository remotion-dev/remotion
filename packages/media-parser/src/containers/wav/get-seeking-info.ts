import type {WavSeekingInfo} from '../../seeking-info';
import type {MediaSectionState} from '../../state/video-section';
import type {WavFmt, WavStructure} from './types';

export const getSeekingInfoFromWav = ({
	structure,
	mediaSectionState,
}: {
	structure: WavStructure;
	mediaSectionState: MediaSectionState;
}): WavSeekingInfo | null => {
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
		type: 'wav-seeking-info',
		sampleRate: fmtBox.sampleRate,
		blockAlign: fmtBox.blockAlign,
		mediaSections: mediaSection[0],
	};
};
