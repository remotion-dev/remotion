import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';

export const canCopyVideoTrack = ({
	inputCodec,
	container,
}: {
	inputCodec: MediaParserVideoCodec;
	container: ConvertMediaContainer;
}) => {
	if (container === 'webm') {
		return inputCodec === 'vp8' || inputCodec === 'vp9';
	}

	if (container === 'mp4') {
		return inputCodec === 'h264' || inputCodec === 'h265';
	}

	if (container === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${container satisfies never}`);
};
