const validOptions = [
	'yuv420p',
	'yuv422p',
	'yuv444p',
	'yuv420p10le',
	'yuv422p10le',
	'yuv444p10le',
] as const;

export type PixelFormat = typeof validOptions[number];

let currentPixelFormat: PixelFormat = 'yuv420p';

export const setPixelFormat = (format: PixelFormat) => {
	if (!validOptions.includes(format)) {
		throw new TypeError(`Value ${format} is not valid as a pixel format.`);
	}
	currentPixelFormat = format;
};

export const getPixelFormat = () => {
	return currentPixelFormat;
};
