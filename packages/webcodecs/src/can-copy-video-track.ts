import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './convert-media';

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

	throw new Error(`Unhandled codec: ${container satisfies never}`);
};
