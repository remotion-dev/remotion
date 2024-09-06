export const getAudioDecoderConfig = async (
	config: AudioDecoderConfig,
): Promise<AudioDecoderConfig | null> => {
	if (typeof AudioDecoder === 'undefined') {
		return null;
	}

	if ((await AudioDecoder.isConfigSupported(config)).supported) {
		return config;
	}

	return null;
};
