import type {StillImageFormat, VideoImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {truthy} from '../truthy';

let currentStillImageFormat: StillImageFormat | undefined;
let currentVideoImageFormat: VideoImageFormat | undefined;

export const setStillImageFormat = (format: StillImageFormat) => {
	if (typeof format === 'undefined') {
		currentStillImageFormat = undefined;
		return;
	}

	if (!RenderInternals.validStillImageFormats.includes(format)) {
		throw new TypeError(
			[
				`Value ${format} is not valid as an image format.`,
				// @ts-expect-error
				format === 'jpg' ? 'Did you mean "jpeg"?' : null,
			]
				.filter(truthy)
				.join(' '),
		);
	}

	currentStillImageFormat = format;
};

export const setVideoImageFormat = (format: VideoImageFormat) => {
	if (typeof format === 'undefined') {
		currentVideoImageFormat = undefined;
		return;
	}

	if (!RenderInternals.validVideoImageFormats.includes(format)) {
		throw new TypeError(
			[
				`Value ${format} is not valid as a video image format.`,
				// @ts-expect-error
				format === 'jpg' ? 'Did you mean "jpeg"?' : null,
			]
				.filter(truthy)
				.join(' '),
		);
	}

	currentVideoImageFormat = format;
};

export const getUserPreferredStillImageFormat = () => {
	return currentStillImageFormat;
};

export const getUserPreferredVideoImageFormat = () => {
	return currentVideoImageFormat;
};
