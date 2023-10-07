// Keeping the default image format PNG if you don't pass a
// value to the renderer for backwards compatibility.

import type {PixelFormat} from './pixel-format';

export const validVideoImageFormats = ['png', 'jpeg', 'none'] as const;
export const validStillImageFormats = ['png', 'jpeg', 'pdf', 'webp'] as const;

export type VideoImageFormat = (typeof validVideoImageFormats)[number];
export type StillImageFormat = (typeof validStillImageFormats)[number];
/**
 * @deprecated Use VideoImageFormat or StillImageFormat instead
 */
export type ImageFormat =
	'This type is deprecated, use VideoImageFormat or StillImageFormat instead';

export const DEFAULT_VIDEO_IMAGE_FORMAT: VideoImageFormat = 'jpeg';
export const DEFAULT_STILL_IMAGE_FORMAT: StillImageFormat = 'png';

// By returning a value, we improve testability as we can specifically test certain branches
export const validateSelectedPixelFormatAndImageFormatCombination = (
	pixelFormat: PixelFormat | undefined,
	videoImageFormat: VideoImageFormat,
): 'none' | 'valid' => {
	if (videoImageFormat === 'none') {
		return 'none';
	}

	if (typeof pixelFormat === 'undefined') {
		return 'valid';
	}

	if (!validVideoImageFormats.includes(videoImageFormat)) {
		throw new TypeError(
			`Value ${videoImageFormat} is not valid as an image format.`,
		);
	}

	if (pixelFormat !== 'yuva420p' && pixelFormat !== 'yuva444p10le') {
		return 'valid';
	}

	if (videoImageFormat !== 'png') {
		throw new TypeError(
			`Pixel format was set to '${pixelFormat}' but the image format is not PNG. To render transparent videos, you need to set PNG as the image format.`,
		);
	}

	return 'valid';
};

export const validateStillImageFormat = (imageFormat: StillImageFormat) => {
	if (!validStillImageFormats.includes(imageFormat)) {
		throw new TypeError(
			String(
				`Image format should be one of: ${validStillImageFormats
					.map((v) => `"${v}"`)
					.join(', ')}`,
			),
		);
	}
};
