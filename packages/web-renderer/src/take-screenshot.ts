import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {findSvgElements} from './find-svg-elements';

export const takeScreenshot = async (
	div: HTMLDivElement,
	width: number,
	height: number,
) => {
	const canvasElements = findCanvasElements(div);
	const svgElements = findSvgElements(div);
	const composed = await compose({
		composables: [...canvasElements, ...svgElements],
		width,
		height,
	});

	const imageData = await composed.convertToBlob({
		type: 'image/png',
	});

	return imageData;
};
