import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';

export const canCopyAudioTrack = ({
	inputCodec,
	outputCodec,
	container,
}: {
	inputCodec: MediaParserAudioCodec;
	outputCodec: ConvertMediaAudioCodec;
	container: ConvertMediaContainer;
}) => {
	if (outputCodec === 'opus') {
		return inputCodec === 'opus' && container === 'webm';
	}

	throw new Error(`Unhandled codec: ${outputCodec satisfies never}`);
};
