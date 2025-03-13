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

	const maybeItIsTheSampleRateThatIsTheProblem =
		config.sampleRate !== 48000 && config.sampleRate !== 44100;

	if (maybeItIsTheSampleRateThatIsTheProblem) {
		return getAudioEncoderConfig({
			...config,
			sampleRate: config.sampleRate === 22050 ? 44100 : 48000,
		});
	}

	return null;
};
