import type {Codec} from './codec';

export const validPixelFormats = [
	'yuv420p',
	'yuva420p',
	'yuv422p',
	'yuv444p',
	'yuv420p10le',
	'yuv422p10le',
	'yuv444p10le',
	'yuva444p10le',
] as const;

export type PixelFormat = (typeof validPixelFormats)[number];

export const DEFAULT_PIXEL_FORMAT: PixelFormat = 'yuv420p';

export const validPixelFormatsForCodec = (codec: Codec) => {
	if (codec === 'vp8' || codec === 'vp9') {
		return validPixelFormats;
	}

	return validPixelFormats.filter((format) => format !== 'yuva420p');
};

export const validateSelectedPixelFormatAndCodecCombination = (
	pixelFormat: PixelFormat | undefined,
	codec: Codec,
) => {
	if (typeof pixelFormat === 'undefined') {
		return pixelFormat;
	}

	if (!validPixelFormats.includes(pixelFormat)) {
		throw new TypeError(`Value ${pixelFormat} is not valid as a pixel format.`);
	}

	if (pixelFormat !== 'yuva420p') {
		return;
	}

	const validFormats = validPixelFormatsForCodec(codec);

	if (!(validFormats as string[]).includes(pixelFormat)) {
		throw new TypeError(
			`Pixel format was set to 'yuva420p' but codec ${codec} does not support it. Valid pixel formats for codec ${codec} are: ${validFormats.join(
				', ',
			)}.`,
		);
	}
};
