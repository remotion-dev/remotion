import type {ConvertMediaContainer} from './get-available-containers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const availableAudioCodecs = ['opus', 'aac', 'wav'] as const;
export const getAvailableAudioCodecs = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaAudioCodec[] => {
	if (container === 'mp4') {
		return ['aac'];
	}

	if (container === 'webm') {
		return ['opus'];
	}

	if (container === 'wav') {
		return ['wav'];
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};

export type ConvertMediaAudioCodec = (typeof availableAudioCodecs)[number];
