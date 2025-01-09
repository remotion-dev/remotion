import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';

const getCodecString = (audioCodec: ConvertMediaAudioCodec) => {
	if (audioCodec === 'opus') {
		return 'opus';
	}

	if (audioCodec === 'aac') {
		return 'mp4a.40.02';
	}

	if (audioCodec === 'wav') {
		return 'wav-should-not-to-into-audio-encoder';
	}

	throw new Error(`Unsupported audio codec: ${audioCodec satisfies never}`);
};

export const getAudioEncoderConfig = async (
	config: AudioEncoderConfig & {
		codec: ConvertMediaAudioCodec;
	},
): Promise<AudioEncoderConfig | null> => {
	const actualConfig = {
		...config,
		codec: getCodecString(config.codec),
	};

	if (config.codec === 'wav') {
		return actualConfig;
	}

	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	if ((await AudioEncoder.isConfigSupported(actualConfig)).supported) {
		return actualConfig;
	}

	return null;
};
