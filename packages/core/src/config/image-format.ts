const validOptions = ['png', 'jpeg'] as const;

export type ImageFormat = typeof validOptions[number];

let currentImageFormat: ImageFormat | undefined = undefined;

export const setImageFormat = (format: ImageFormat) => {
	if (typeof format === undefined) {
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
