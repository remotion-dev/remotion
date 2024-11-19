import type {ConvertMediaAudioCodec} from './codec-id';

const getCodecString = (audioCodec: ConvertMediaAudioCodec) => {
	if (audioCodec === 'opus') {
		return 'opus';
	}

	if (audioCodec === 'aac') {
		return 'mp4a.40.02';
	}

	throw new Error(`Unsupported audio codec: ${audioCodec satisfies never}`);
};

export const getAudioEncoderConfig = async (
	config: AudioEncoderConfig,
): Promise<AudioEncoderConfig | null> => {
	const actualConfig = {
		...config,
		codec: getCodecString(config.codec as ConvertMediaAudioCodec),
	};
	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	if ((await AudioEncoder.isConfigSupported(actualConfig)).supported) {
		return actualConfig;
	}

	return null;
};
