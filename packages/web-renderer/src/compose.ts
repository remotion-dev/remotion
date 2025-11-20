import type {Composable} from './composable';
import {composeCanvas} from './compose-canvas';

export const compose = async ({
	composables,
	width,
	height,
}: {
	composables: Composable[];
	width: number;
	height: number;
}) => {
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	// TODO: Consider z-index
	for (const composable of composables) {
		if (
			composable.type === 'canvas' ||
			composable.type === 'img' ||
			composable.type === 'svg'
		) {
			await composeCanvas(composable.element, context);
		}
	}

	return canvas;
};
