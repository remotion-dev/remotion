import {compose} from './compose';
import type {RenderStillOnWebImageFormat} from './render-still-on-web';

export const createFrame = async ({
	div,
	width,
	height,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
}) => {
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	await compose({element: div, context, offsetLeft: 0, offsetTop: 0});

	return canvas;
};

export const takeScreenshot = async ({
	div,
	width,
	height,
	imageFormat,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	imageFormat: RenderStillOnWebImageFormat;
}) => {
	const frame = await createFrame({div, width, height});

	const imageData = await frame.convertToBlob({
		type: `image/${imageFormat}`,
	});

	return imageData;
};
