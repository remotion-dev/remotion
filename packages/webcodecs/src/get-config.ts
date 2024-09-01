export const getVideoDecoderConfigWithHardwareAcceleration = async (
	config: VideoDecoderConfig,
): Promise<VideoDecoderConfig | null> => {
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

export const getVideoEncoderConfigWithHardwareAcceleration = async (
	config: VideoEncoderConfig,
): Promise<VideoEncoderConfig | null> => {
	const hardware: VideoEncoderConfig = {
		...config,
		hardwareAcceleration: 'prefer-hardware',
	};

	if ((await VideoEncoder.isConfigSupported(hardware)).supported) {
		return hardware;
	}

	const software: VideoEncoderConfig = {
		...config,
		hardwareAcceleration: 'prefer-software',
	};

	if ((await VideoEncoder.isConfigSupported(software)).supported) {
		return software;
	}

	return null;
};
