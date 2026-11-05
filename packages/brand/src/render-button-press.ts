import {Internals} from 'remotion';

// The captured button can be resized independently because its backdrop is solid.
export const renderButtonPress = Internals.createEffect<{scale: number}, null>({
	type: 'studio-update/render-button-press',
	label: 'Render button press',
	documentationLink: null,
	backend: '2d',
	calculateKey: ({scale}) => `render-button-press-${scale}`,
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const context = target.getContext('2d');
		if (!context) {
			throw new Error('Could not create the render-button press canvas.');
		}

		context.clearRect(0, 0, width, height);
		context.drawImage(source, 0, 0, width, height);
		const x = (1398 / 2736) * width;
		const y = (1000 / 1976) * height;
		const buttonWidth = (638 / 2736) * width;
		const buttonHeight = (208 / 1976) * height;

		// Extend the adjacent backdrop across the button's original bounds.
		context.drawImage(
			source,
			(1380 / 2736) * width,
			y,
			(8 / 2736) * width,
			buttonHeight,
			x,
			y,
			buttonWidth,
			buttonHeight,
		);
		context.drawImage(
			source,
			x,
			y,
			buttonWidth,
			buttonHeight,
			x + (buttonWidth * (1 - params.scale)) / 2,
			y + (buttonHeight * (1 - params.scale)) / 2,
			buttonWidth * params.scale,
			buttonHeight * params.scale,
		);
	},
	cleanup: () => undefined,
	schema: {
		scale: {
			type: 'number',
			hiddenFromList: false,
			min: 0.8,
			max: 1,
			default: 1,
			step: 0.01,
		},
	},
	validateParams: ({scale}) => {
		if (!Number.isFinite(scale) || scale < 0.8 || scale > 1) {
			throw new Error('Render button scale must be between 0.8 and 1.');
		}
	},
});
