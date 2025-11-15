import type {Composable} from './composable';
import {composeCanvas} from './compose-canvas';
import {svgToImageBitmap} from './compose-svg';

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
		if (composable.type === 'canvas' || composable.type === 'img') {
			composeCanvas(composable.element, context);
		} else if (composable.type === 'svg') {
			// This already accumulates the transforms of the parent
			const imageBitmap = await svgToImageBitmap(composable.element);

			if (imageBitmap) {
				context.drawImage(
					imageBitmap.image,
					imageBitmap.left,
					imageBitmap.top,
					imageBitmap.width,
					imageBitmap.height,
				);
			}
		}
	}

	return canvas;
};
