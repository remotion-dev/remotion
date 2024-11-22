import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './codec-id';

export const canCopyAudioTrack = ({
	inputCodec,
	container,
}: {
	inputCodec: MediaParserAudioCodec;
	container: ConvertMediaContainer;
}) => {
	if (container === 'webm') {
		return inputCodec === 'opus';
	}

	if (container === 'mp4') {
		return inputCodec === 'aac';
	}

	if (container === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${container satisfies never}`);
};
