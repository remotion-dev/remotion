import type {Composable} from './compose';

export const findCanvasElements = (element: HTMLDivElement) => {
	const canvasElements = element.querySelectorAll('canvas');

	const composables: Composable[] = [];

	Array.from(canvasElements).forEach((canvasElement) => {
		const canvas = canvasElement as HTMLCanvasElement;
		composables.push(canvas);
	});

	return composables;
};
