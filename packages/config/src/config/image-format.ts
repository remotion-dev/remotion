import {ImageFormat, RenderInternals} from '@remotion/renderer';

let currentImageFormat: ImageFormat | undefined;

export const setImageFormat = (format: ImageFormat) => {
	if (typeof format === 'undefined') {
		currentImageFormat = undefined;
		return;
	}

	if (!RenderInternals.validImageFormats.includes(format)) {
		throw new TypeError(`Value ${format} is not valid as an image format.`);
	}

	currentImageFormat = format;
};

export const getUserPreferredImageFormat = () => {
	return currentImageFormat;
};
