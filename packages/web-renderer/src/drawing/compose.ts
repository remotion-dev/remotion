import type {Composable} from '../composable';
import {drawElementToCanvas} from './draw-element-to-canvas';

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

	for (const composable of composables) {
		await drawElementToCanvas(composable.element, context);
	}

	return canvas;
};
