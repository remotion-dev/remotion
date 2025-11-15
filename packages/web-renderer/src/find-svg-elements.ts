import type {Composable} from './composable';

export const findCapturableElements = (element: HTMLDivElement) => {
	const canvasAndSvgElements = element.querySelectorAll('canvas,svg');

	const composables: Composable[] = [];

	Array.from(canvasAndSvgElements).forEach((svgElement) => {
		if (svgElement.tagName === 'CANVAS') {
			const canvas = svgElement as HTMLCanvasElement;
			composables.push({
				type: 'canvas',
				element: canvas,
			});
		} else if (svgElement.tagName === 'SVG') {
			const svg = svgElement as SVGSVGElement;
			composables.push({
				type: 'svg',
				element: svg,
			});
		}
	});

	return composables;
};
