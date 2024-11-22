import type {ConvertMediaContainer} from './get-available-containers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const availableVideoCodecs = ['vp8', 'vp9', 'h264'] as const;
export type ConvertMediaVideoCodec = (typeof availableVideoCodecs)[number];

export const getAvailableVideoCodecs = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaVideoCodec[] => {
	if (container === 'mp4') {
		return ['h264'];
	}

	if (container === 'webm') {
		return ['vp8', 'vp9'];
	}

	if (container === 'wav') {
		return [];
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};
