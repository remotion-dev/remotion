// Keeping the default image format PNG if you don't pass a
// value to the renderer for backwards compatibility.

import type {PixelFormat} from './pixel-format';

const validImageFormats = ['png', 'jpeg', 'none'] as const;

export type ImageFormat = typeof validImageFormats[number];

export type StillImageFormat = 'png' | 'jpeg';

// However, the CLI will override it and use JPEG if suitable.
export const DEFAULT_IMAGE_FORMAT: ImageFormat = 'png';

// By returning a value, we improve testability as we can specifically test certain branches
export const validateSelectedPixelFormatAndImageFormatCombination = (
	pixelFormat: PixelFormat,
	imageFormat: ImageFormat
): 'none' | 'valid' => {
	if (imageFormat === 'none') {
		return 'none';
	}

	if (!validImageFormats.includes(imageFormat)) {
		throw new TypeError(
			`Value ${imageFormat} is not valid as an image format.`
		);
	}

	if (pixelFormat !== 'yuva420p' && pixelFormat !== 'yuva444p10le') {
		return 'valid';
	}

	if (imageFormat !== 'png') {
		throw new TypeError(
			`Pixel format was set to '${pixelFormat}' but the image format is not PNG. To render transparent videos, you need to set PNG as the image format.`
		);
	}

	return 'valid';
};

export const validateNonNullImageFormat = (imageFormat: ImageFormat) => {
	if (imageFormat !== 'jpeg' && imageFormat !== 'png') {
		throw new TypeError('Image format should be either "png" or "jpeg"');
	}
};
