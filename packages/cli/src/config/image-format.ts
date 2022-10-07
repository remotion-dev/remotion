import type {ImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {truthy} from '../truthy';

let currentImageFormat: ImageFormat | undefined;

export const setImageFormat = (format: ImageFormat) => {
	if (typeof format === 'undefined') {
		currentImageFormat = undefined;
		return;
	}

	if (!RenderInternals.validImageFormats.includes(format)) {
		throw new TypeError(
			[
				`Value ${format} is not valid as an image format.`,
				// @ts-expect-error
				format === 'jpg' ? 'Did you mean "jpeg"?' : null,
			]
				.filter(truthy)
				.join(' ')
		);
	}

	currentImageFormat = format;
};

export const getUserPreferredImageFormat = () => {
	return currentImageFormat;
};
