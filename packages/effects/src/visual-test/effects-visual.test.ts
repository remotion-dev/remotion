import {expect, test} from 'vitest';
import {blur} from '../blur.js';
import {evolve} from '../evolve.js';
import {noise} from '../noise.js';
import {pixelDissolve} from '../pixel-dissolve.js';
import {vignette} from '../vignette.js';
import {
	descriptorsToMemoizedEffects,
	renderEffectChainToCanvas,
	renderEffectChainToBlob,
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

test('vignette() color mode works on transparent sources', async () => {
	const width = 40;
	const height = 40;
	const source = document.createElement('canvas');
	source.width = width;
	source.height = height;

	const sourceCtx = source.getContext('2d');
	if (!sourceCtx) {
		throw new Error('Could not get 2D context');
	}

	sourceCtx.clearRect(0, 0, width, height);

	const canvas = await renderEffectChainToCanvas({
		source,
		effects: descriptorsToMemoizedEffects([
			vignette({
				amount: 1,
				radius: 0.5,
				feather: 0,
				color: 'rgba(0, 0, 0, 0.5)',
			}),
		]),
		width,
		height,
	});
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2D context');
	}

	const corner = ctx.getImageData(0, 0, 1, 1).data;
	if (corner[3] !== 128) {
		throw new Error(`Expected vignette alpha to be 128, got ${corner[3]}`);
	}

	const center = ctx.getImageData(width / 2, height / 2, 1, 1).data;
	if (center[3] !== 0) {
		throw new Error(`Expected center alpha to stay 0, got ${center[3]}`);
	}
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
