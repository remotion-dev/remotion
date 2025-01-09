import {isSafari} from './browser-quirks';
import {chooseCorrectAvc1Profile} from './choose-correct-avc1-profile';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const getVideoEncoderConfig = async ({
	codec,
	height,
	width,
	fps,
}: {
	width: number;
	height: number;
	codec: ConvertMediaVideoCodec;
	fps: number | null;
}): Promise<VideoEncoderConfig | null> => {
	if (typeof VideoEncoder === 'undefined') {
		return null;
	}

	const config: VideoEncoderConfig = {
		codec:
			codec === 'h264'
				? chooseCorrectAvc1Profile({fps, height, width})
				: codec === 'vp9'
					? 'vp09.00.10.08'
					: codec,
		height,
		width,
		bitrate: isSafari() ? 3_000_000 : undefined,
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
