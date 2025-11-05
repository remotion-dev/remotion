import type {Composable} from './composable';

export const findCanvasElements = (element: HTMLDivElement) => {
	const canvasElements = element.querySelectorAll('canvas');

	const composables: Composable[] = [];

	Array.from(canvasElements).forEach((canvasElement) => {
		const canvas = canvasElement as HTMLCanvasElement;

		composables.push({
			type: 'canvas',
			element: canvas,
		});
	});

	return composables;
};
