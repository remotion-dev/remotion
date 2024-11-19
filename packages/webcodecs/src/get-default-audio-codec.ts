import type {ConvertMediaAudioCodec, ConvertMediaContainer} from './codec-id';

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
