import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';

export const getDefaultAudioCodec = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaAudioCodec => {
	if (container === 'webm') {
		return 'opus';
	}

	if (container === 'mp4') {
		return 'aac';
	}

	if (container === 'wav') {
		return 'wav';
	}

	throw new Error(`Unhandled container: ${container satisfies never}`);
};
