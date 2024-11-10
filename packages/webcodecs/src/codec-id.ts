const availableVideoCodecs = ['vp8', 'vp9'] as const;
export const getAvailableVideoCodecs = () => availableVideoCodecs;
export type ConvertMediaVideoCodec = (typeof availableVideoCodecs)[number];

export const renderVideoCodecLabel = (codec: ConvertMediaVideoCodec) => {
	if (codec === 'vp8') {
		return 'VP8';
	}

	if (codec === 'vp9') {
		return 'VP9';
	}

	throw new Error(`Unknown video codec ${codec satisfies never}`);
};

const availableAudioCodecs = ['opus'] as const;
export const getAvailableAudioCodecs = () => availableAudioCodecs;
export type ConvertMediaAudioCodec = (typeof availableAudioCodecs)[number];

export const renderAudioCodecLabel = (codec: ConvertMediaAudioCodec) => {
	if (codec === 'opus') {
		return 'Opus';
	}

	throw new Error(`Unknown audio codec ${codec satisfies never}`);
};
