import {expect, test} from 'vitest';
import type {RenderMediaOnWebProgress} from '../render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';

test('should reject with invalid frame range', async () => {
	const Component: React.FC = () => {
		return null;
	};

	const prom = renderMediaOnWeb({
		composition: {
			component: Component,
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 20,
		},
		inputProps: {},
		frameRange: [-10, 50],
	});
	await expect(prom).rejects.toThrow(
		'The "durationInFrames" of the composition was evaluated to be 20, but frame range -10-50 is not inbetween 0-19',
	);
});

test('should render with valid frame range', async () => {
	const Component: React.FC = () => {
		return null;
	};

	let finalProgress: RenderMediaOnWebProgress | null = null;

	await renderMediaOnWeb({
		composition: {
			component: Component,
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 20,
		},
		onProgress: (progress) => {
			finalProgress = progress;
		},
		inputProps: {},
		frameRange: [10, 15],
	});
	expect(finalProgress).toEqual({
		renderedFrames: 6,
		encodedFrames: 6,
	});
});
