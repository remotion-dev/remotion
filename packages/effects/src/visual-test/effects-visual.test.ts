import {expect, test} from 'vitest';
import {blur} from '../blur.js';
import {evolve} from '../evolve.js';
import {exposure} from '../exposure.js';
import {noise} from '../noise.js';
import {pixelDissolve} from '../pixel-dissolve.js';
import {vibrance} from '../vibrance.js';
import {vignette} from '../vignette.js';
import {whiteBalance} from '../white-balance.js';
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

test('exposure() applies stops in linear light and preserves alpha', async () => {
	const source = document.createElement('canvas');
	source.width = 1;
	source.height = 1;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.putImageData(
		new ImageData(new Uint8ClampedArray([128, 128, 128, 128]), 1, 1),
		0,
		0,
	);

	const canvas = await renderEffectChainToCanvas({
		source,
		width: 1,
		height: 1,
		effects: descriptorsToMemoizedEffects([exposure({stops: 1})]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixel = context.getImageData(0, 0, 1, 1).data;
	expect(pixel[0]).toBeGreaterThanOrEqual(174);
	expect(pixel[0]).toBeLessThanOrEqual(176);
	expect(pixel[1]).toBe(pixel[0]);
	expect(pixel[2]).toBe(pixel[0]);
	expect(pixel[3]).toBe(128);
});

test('whiteBalance() applies temperature and tint while preserving alpha', async () => {
	const source = document.createElement('canvas');
	source.width = 1;
	source.height = 1;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.putImageData(
		new ImageData(new Uint8ClampedArray([128, 128, 128, 128]), 1, 1),
		0,
		0,
	);

	const warmCanvas = await renderEffectChainToCanvas({
		source,
		width: 1,
		height: 1,
		effects: descriptorsToMemoizedEffects([whiteBalance({temperature: 1})]),
	});
	const warmContext = warmCanvas.getContext('2d');
	if (!warmContext) {
		throw new Error('Could not get warm output context');
	}

	const warmPixel = warmContext.getImageData(0, 0, 1, 1).data;
	expect(warmPixel[0]).toBeGreaterThan(warmPixel[1]);
	expect(warmPixel[1]).toBeGreaterThan(warmPixel[2]);
	expect(warmPixel[3]).toBe(128);

	const magentaCanvas = await renderEffectChainToCanvas({
		source,
		width: 1,
		height: 1,
		effects: descriptorsToMemoizedEffects([whiteBalance({tint: 1})]),
	});
	const magentaContext = magentaCanvas.getContext('2d');
	if (!magentaContext) {
		throw new Error('Could not get magenta output context');
	}

	const magentaPixel = magentaContext.getImageData(0, 0, 1, 1).data;
	expect(magentaPixel[0]).toBeGreaterThan(magentaPixel[1]);
	expect(magentaPixel[2]).toBeGreaterThan(magentaPixel[1]);
	expect(Math.abs(magentaPixel[0] - magentaPixel[2])).toBeLessThanOrEqual(1);
	expect(magentaPixel[3]).toBe(128);
});

test('vibrance() boosts muted colors more than vivid colors', async () => {
	const source = document.createElement('canvas');
	source.width = 3;
	source.height = 1;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.putImageData(
		new ImageData(
			new Uint8ClampedArray([
				153, 102, 102, 128, 204, 51, 51, 128, 128, 128, 128, 128,
			]),
			3,
			1,
		),
		0,
		0,
	);

	const canvas = await renderEffectChainToCanvas({
		source,
		width: 3,
		height: 1,
		effects: descriptorsToMemoizedEffects([vibrance({amount: 0.5})]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixels = context.getImageData(0, 0, 3, 1).data;
	const mutedRedChange = pixels[0] - 153;
	const vividRedChange = pixels[4] - 204;
	expect(mutedRedChange).toBeGreaterThanOrEqual(45);
	expect(vividRedChange).toBeGreaterThanOrEqual(20);
	expect(mutedRedChange).toBeGreaterThan(vividRedChange);
	expect(pixels[8]).toBeGreaterThanOrEqual(127);
	expect(pixels[8]).toBeLessThanOrEqual(129);
	expect(pixels[9]).toBe(pixels[8]);
	expect(pixels[10]).toBe(pixels[8]);
	expect(pixels[3]).toBe(128);
	expect(pixels[7]).toBe(128);
	expect(pixels[11]).toBe(128);
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
