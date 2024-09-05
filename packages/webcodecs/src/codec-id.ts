export type ConvertMediaVideoCodec = 'vp8';

export const codecNameToMatroskaCodecId = (
	codecName: ConvertMediaVideoCodec,
) => {
	if (codecName === 'vp8') {
		return 'V_VP8';
	}

	throw new Error(`Unknown codec: ${codecName}`);
};

export type ConvertMediaAudioCodec = 'opus';

export const codecNameToMatroskaAudioCodecId = (
	codecName: ConvertMediaAudioCodec,
) => {
	if (codecName === 'opus') {
		return 'A_OPUS';
	}

	throw new Error(`Unknown codec: ${codecName}`);
};
