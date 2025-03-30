import type {WavSeekingInfo} from '../../seeking-info';
import type {VideoSectionState} from '../../state/video-section';
import type {WavFmt, WavStructure} from './types';

export const getSeekingInfoFromWav = ({
	structure,
	videoSectionState,
}: {
	structure: WavStructure;
	videoSectionState: VideoSectionState;
}): WavSeekingInfo | null => {
	const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt') as
		| WavFmt
		| undefined;

	if (!fmtBox) {
		return null;
	}

	const videoSection = videoSectionState.getVideoSections();
	if (videoSection.length !== 1) {
		return null;
	}

	return {
		type: 'wav-seeking-info',
		sampleRate: fmtBox.sampleRate,
		blockAlign: fmtBox.blockAlign,
		videoSection: videoSection[0],
	};
};
