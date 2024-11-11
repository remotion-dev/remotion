export const getAudioEncoderConfig = async (
	config: AudioEncoderConfig,
): Promise<AudioEncoderConfig | null> => {
	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	if ((await AudioEncoder.isConfigSupported(config)).supported) {
		return config;
	}

	return null;
};
