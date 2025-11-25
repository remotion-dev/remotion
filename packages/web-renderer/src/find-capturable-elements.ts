import type {Composable} from './composable';

export const findCapturableElements = (element: HTMLDivElement) => {
	const canvasAndSvgElements = element.querySelectorAll('svg,canvas,img');

	const composables: Composable[] = [];

	Array.from(canvasAndSvgElements).forEach((capturableElement) => {
		if (capturableElement.tagName.toLocaleLowerCase() === 'canvas') {
			const canvas = capturableElement as HTMLCanvasElement;
			composables.push({
				type: 'canvas',
				element: canvas,
			});
		} else if (capturableElement.tagName.toLocaleLowerCase() === 'svg') {
			const svg = capturableElement as SVGSVGElement;
			composables.push({
				type: 'svg',
				element: svg,
			});
		} else if (capturableElement.tagName.toLocaleLowerCase() === 'img') {
			const img = capturableElement as HTMLImageElement;
			composables.push({
				type: 'img',
				element: img,
			});
		}
	});

	return composables;
};
