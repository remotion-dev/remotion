import type {Composable} from './composable';

export const findSvgElements = (element: HTMLDivElement) => {
	const svgElements = element.querySelectorAll('svg');

	const composables: Composable[] = [];

	Array.from(svgElements).forEach((svgElement) => {
		composables.push({
			type: 'svg',
			element: svgElement,
		});
	});

	return composables;
};
