import {PixelFormat} from './pixel-format';

const validOptions = ['png', 'jpeg', 'none'] as const;

export type ImageFormat = typeof validOptions[number];

let currentImageFormat: ImageFormat | undefined;

export const setImageFormat = (format: ImageFormat) => {
	if (typeof format === 'undefined') {
		currentImageFormat = undefined;
		return;
	}

	if (!validOptions.includes(format)) {
		throw new TypeError(`Value ${format} is not valid as an image format.`);
	}

	currentImageFormat = format;
};

export const getUserPreferredImageFormat = () => {
	return currentImageFormat;
};

export const validateSelectedPixelFormatAndImageFormatCombination = (
	pixelFormat: PixelFormat,
	imageFormat: ImageFormat
) => {
	if (imageFormat === 'none') {
		return;
	}

	if (!validOptions.includes(imageFormat)) {
		throw new TypeError(
			`Value ${imageFormat} is not valid as an image format.`
		);
	}

	if (pixelFormat !== 'yuva420p') {
		return;
	}

	if (imageFormat !== 'png') {
		throw new TypeError(
			"Pixel format was set to 'yuva420p' but the image format is not PNG. To render transparent videos, you need to set PNG as the image format."
		);
	}
};
