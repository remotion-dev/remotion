import type {Codec} from './codec';

const validOptions = [
	'yuv420p',
	'yuva420p',
	'yuv422p',
	'yuv444p',
	'yuv420p10le',
	'yuv422p10le',
	'yuv444p10le',
	'yuva444p10le',
] as const;

export type PixelFormat = typeof validOptions[number];

export const DEFAULT_PIXEL_FORMAT: PixelFormat = 'yuv420p';

let currentPixelFormat: PixelFormat = DEFAULT_PIXEL_FORMAT;

export const setPixelFormat = (format: PixelFormat) => {
	if (!validOptions.includes(format)) {
		throw new TypeError(`Value ${format} is not valid as a pixel format.`);
	}

	currentPixelFormat = format;
};

export const getPixelFormat = () => {
	return currentPixelFormat;
};

export const validateSelectedPixelFormatAndCodecCombination = (
	pixelFormat: PixelFormat,
	codec: Codec
) => {
	if (!validOptions.includes(pixelFormat)) {
		throw new TypeError(`Value ${pixelFormat} is not valid as a pixel format.`);
	}

	if (pixelFormat !== 'yuva420p') {
		return;
	}

	if (codec !== 'vp8' && codec !== 'vp9') {
		throw new TypeError(
			"Pixel format was set to 'yuva420p' but codec is not 'vp8' or 'vp9'. To render videos with alpha channel, you must choose a codec that supports it."
		);
	}
};
