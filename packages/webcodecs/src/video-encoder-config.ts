import {isSafari} from './browser-quirks';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {getCodecStringForEncoder} from './get-codec-string';

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
		codec: getCodecStringForEncoder({codec, fps, height, width}),
		height,
		width,
		bitrate: isSafari() ? 3_000_000 : undefined,
		bitrateMode: codec === 'vp9' && !isSafari() ? 'quantizer' : undefined,
		framerate: fps ?? undefined,
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
