import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './convert-media';

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

	throw new Error(`Unhandled codec: ${container satisfies never}`);
};
