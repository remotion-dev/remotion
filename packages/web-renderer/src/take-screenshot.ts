import {compose} from './drawing/compose';
import {findCapturableElements} from './find-capturable-elements';
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
	const composables = findCapturableElements(div);
	const composed = await compose({
		composables,
		width,
		height,
	});

	return composed;
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
