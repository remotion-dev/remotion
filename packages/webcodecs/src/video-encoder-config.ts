export const getVideoEncoderConfig = async (
	config: VideoEncoderConfig,
): Promise<VideoEncoderConfig | null> => {
	if (typeof VideoEncoder === 'undefined') {
		return null;
	}

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
