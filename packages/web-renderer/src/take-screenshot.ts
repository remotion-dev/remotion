import {compose} from './compose';
import {findCapturableElements} from './find-svg-elements';
import type {RenderStillOnWebImageFormat} from './render-still-on-web';

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
	const composables = findCapturableElements(div);
	const composed = await compose({
		composables,
		width,
		height,
	});

	const imageData = await composed.convertToBlob({
		type: `image/${imageFormat}`,
	});

	return imageData;
};
