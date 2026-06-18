import {expect, test} from 'vitest';
import {blur} from '../blur.js';
import {evolve} from '../evolve.js';
import {noise} from '../noise.js';
import {pixelDissolve} from '../pixel-dissolve.js';
import {
	descriptorsToMemoizedEffects,
	renderEffectChainToBlob,
	renderEffectChainToCanvas,
	testImage,
} from './visual-utils.js';

test('stacks repeated WebGL effects without blanking or flipping the image', async () => {
	const blob = await renderEffectChainToBlob({
		effects: descriptorsToMemoizedEffects([
			blur({radius: 12}),
			blur({radius: 12}),
			noise({amount: 0.08, seed: 1}),
		]),
	});

	await testImage({
		blob,
		testId: 'stacked-blur-blur-noise',
	});
});

test('evolve() reveals with feather', async () => {
	const blob = await renderEffectChainToBlob({
		effects: descriptorsToMemoizedEffects([
			evolve({progress: 0.55, direction: 'left', feather: 0.18}),
		]),
	});

	await testImage({
		blob,
		testId: 'evolve-left-feather',
	});
});

const maxAlphaForPixelDissolveProgress = async (progress: number) => {
	const canvas = await renderEffectChainToCanvas({
		width: 32,
		height: 32,
		effects: descriptorsToMemoizedEffects([
			pixelDissolve({
				progress,
				columns: 1,
				rows: 1,
				seed: 0,
				feather: 0.5,
			}),
		]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get 2D context');
	}

	const {data} = context.getImageData(0, 0, canvas.width, canvas.height);
	let maxAlpha = 0;
	for (let i = 3; i < data.length; i += 4) {
		maxAlpha = Math.max(maxAlpha, data[i]);
	}

	return maxAlpha;
};

test('pixelDissolve() smoothly fades to full transparency with feather', async () => {
	const tailAlpha = await maxAlphaForPixelDissolveProgress(0.95);
	expect(tailAlpha).toBeGreaterThan(5);
	expect(tailAlpha).toBeLessThan(30);

	const nearlyDoneAlpha = await maxAlphaForPixelDissolveProgress(0.99);
	expect(nearlyDoneAlpha).toBeLessThanOrEqual(2);

	const doneAlpha = await maxAlphaForPixelDissolveProgress(1);
	expect(doneAlpha).toBe(0);
});
