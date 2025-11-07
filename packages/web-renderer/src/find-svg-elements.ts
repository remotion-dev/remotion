import type {Composable} from './composable';

export const findSvgElements = (element: HTMLDivElement) => {
	const svgElements = element.querySelectorAll('svg');

	const composables: Composable[] = [];

	Array.from(svgElements).forEach((svgElement) => {
		const svg = svgElement as SVGSVGElement;

		composables.push({
			type: 'svg',
			element: svg,
		});
	});

	return composables;
};
