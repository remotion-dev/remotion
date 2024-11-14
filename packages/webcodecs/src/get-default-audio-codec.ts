import type {ConvertMediaAudioCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';

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

	throw new Error(`Unhandled container: ${container satisfies never}`);
};
