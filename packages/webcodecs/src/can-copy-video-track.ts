import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';

export const canCopyVideoTrack = ({
	inputCodec,
	outputCodec,
	container,
}: {
	inputCodec: MediaParserVideoCodec;
	outputCodec: ConvertMediaVideoCodec;
	container: ConvertMediaContainer;
}) => {
	if (outputCodec === 'vp8') {
		return inputCodec === 'vp8' && container === 'webm';
	}

	if (outputCodec === 'vp9') {
		return inputCodec === 'vp9' && container === 'webm';
	}

	throw new Error(`Unhandled codec: ${outputCodec satisfies never}`);
};
