import type {ConvertMediaVideoCodec} from './codec-id';

export const getVideoEncoderConfig = async ({
	width,
	height,
	codec,
}: {
	width: number;
	height: number;
	codec: ConvertMediaVideoCodec;
}): Promise<VideoEncoderConfig | null> => {
	if (typeof VideoEncoder === 'undefined') {
		return null;
	}

	const config: VideoEncoderConfig = {
		codec:
			codec === 'h264'
				? 'avc1.640020'
				: codec === 'vp9'
					? 'vp09.00.10.08'
					: codec,
		height,
		width,
	};

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
