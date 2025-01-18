import type {
	MediaParserAudioCodec,
	MediaParserContainer,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';

export const canCopyAudioTrack = ({
	inputCodec,
	outputContainer,
	inputContainer,
}: {
	inputCodec: MediaParserAudioCodec;
	outputContainer: ConvertMediaContainer;
	inputContainer: MediaParserContainer;
}) => {
	if (outputContainer === 'webm') {
		return inputCodec === 'opus';
	}

	if (outputContainer === 'mp4') {
		return (
			inputCodec === 'aac' &&
			(inputContainer === 'mp4' || inputContainer === 'avi')
		);
	}

	if (outputContainer === 'wav') {
		return false;
	}

	throw new Error(`Unhandled container: ${outputContainer satisfies never}`);
};
