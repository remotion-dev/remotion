export const getVideoDecoderConfigWithHardwareAcceleration = async (
	config: VideoDecoderConfig,
): Promise<VideoDecoderConfig | null> => {
	if (typeof VideoDecoder === 'undefined') {
		return null;
	}

	const hardware: VideoDecoderConfig = {
		...config,
		hardwareAcceleration: 'prefer-hardware',
	};

	if ((await VideoDecoder.isConfigSupported(hardware)).supported) {
		return hardware;
	}

	const software: VideoDecoderConfig = {
		...config,
		hardwareAcceleration: 'prefer-software',
	};

	if ((await VideoDecoder.isConfigSupported(software)).supported) {
		return software;
	}

	return null;
};
