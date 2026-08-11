import type {ConvertMediaContainer} from './get-available-containers';

export const availableVideoCodecs = ['vp8', 'vp9', 'h264', 'h265'] as const;
export type ConvertMediaVideoCodec = (typeof availableVideoCodecs)[number];

export const getAvailableVideoCodecs = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaVideoCodec[] => {
	if (container === 'mp4') {
		return ['h264', 'h265'];
	}

	if (container === 'webm') {
		return ['vp8', 'vp9'];
	}

	if (container === 'wav') {
		return [];
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};
