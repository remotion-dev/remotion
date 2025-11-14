import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {findSvgElements} from './find-svg-elements';
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
	const canvasElements = findCanvasElements(div);
	const svgElements = findSvgElements(div);
	const composed = await compose({
		composables: [...canvasElements, ...svgElements],
		width,
		height,
	});

	const imageData = await composed.convertToBlob({
		type: `image/${imageFormat}`,
	});

	return imageData;
};
