import type {Composable} from './composable';

export const findCapturableElements = (element: HTMLDivElement) => {
	const canvasAndSvgElements = element.querySelectorAll('canvas,svg,img');

	const composables: Composable[] = [];

	Array.from(canvasAndSvgElements).forEach((capturableElement) => {
		if (capturableElement.tagName === 'CANVAS') {
			const canvas = capturableElement as HTMLCanvasElement;
			composables.push({
				type: 'canvas',
				element: canvas,
			});
		} else if (capturableElement.tagName === 'SVG') {
			const svg = capturableElement as SVGSVGElement;
			composables.push({
				type: 'svg',
				element: svg,
			});
		} else if (capturableElement.tagName === 'IMG') {
			const img = capturableElement as HTMLImageElement;
			composables.push({
				type: 'img',
				element: img,
			});
		}
	});

	return composables;
};
