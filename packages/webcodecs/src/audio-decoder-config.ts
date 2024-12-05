export const getAudioDecoderConfig = async (
	config: AudioDecoderConfig,
): Promise<AudioDecoderConfig | null> => {
	if (config.codec === 'pcm-s16') {
		return config;
	}

	if (typeof AudioDecoder === 'undefined') {
		return null;
	}

	if (typeof EncodedAudioChunk === 'undefined') {
		return null;
	}

	if ((await AudioDecoder.isConfigSupported(config)).supported) {
		return config;
	}

	return null;
};
