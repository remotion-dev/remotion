import {expect, test} from 'vitest';
import {blur} from '../blur.js';
import {colorCorrection} from '../color-correction.js';
import {contrast} from '../contrast.js';
import {evolve} from '../evolve.js';
import {exposure} from '../exposure.js';
import {levels} from '../levels.js';
import {noise} from '../noise.js';
import {outline} from '../outline.js';
import {pixelDissolve} from '../pixel-dissolve.js';
import {saturation} from '../saturation.js';
import {scale} from '../scale.js';
import {shadowsHighlights} from '../shadows-highlights.js';
import {tile} from '../tile.js';
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

test('outline() draws around alpha while preserving the source', async () => {
	const width = 64;
	const height = 64;
	const source = document.createElement('canvas');
	source.width = width;
	source.height = height;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.fillStyle = 'white';
	sourceContext.fillRect(24, 24, 16, 16);

	const canvas = await renderEffectChainToCanvas({
		source,
		width,
		height,
		effects: descriptorsToMemoizedEffects([
			outline({width: 6, color: '#ff0000'}),
		]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const outlinePixel = context.getImageData(20, 32, 1, 1).data;
	expect(outlinePixel[0]).toBeGreaterThanOrEqual(250);
	expect(outlinePixel[1]).toBeLessThanOrEqual(5);
	expect(outlinePixel[2]).toBeLessThanOrEqual(5);
	expect(outlinePixel[3]).toBeGreaterThanOrEqual(250);

	const sourcePixel = context.getImageData(32, 32, 1, 1).data;
	expect([...sourcePixel]).toEqual([255, 255, 255, 255]);

	const transparentPixel = context.getImageData(8, 8, 1, 1).data;
	expect([...transparentPixel]).toEqual([0, 0, 0, 0]);

	const smoothCornerPixel = context.getImageData(19, 19, 1, 1).data;
	expect(smoothCornerPixel[3]).toBeLessThanOrEqual(20);

	const polygonalCanvas = await renderEffectChainToCanvas({
		source,
		width,
		height,
		effects: descriptorsToMemoizedEffects([
			outline({width: 6, edgeSimplification: 8, color: '#ff0000'}),
		]),
	});
	const polygonalContext = polygonalCanvas.getContext('2d');
	if (!polygonalContext) {
		throw new Error('Could not get polygonal outline output context');
	}

	const polygonalCornerPixel = polygonalContext.getImageData(19, 19, 1, 1).data;
	expect(polygonalCornerPixel[0]).toBeGreaterThanOrEqual(250);
	expect(polygonalCornerPixel[1]).toBeLessThanOrEqual(5);
	expect(polygonalCornerPixel[2]).toBeLessThanOrEqual(5);
	expect(polygonalCornerPixel[3]).toBeGreaterThanOrEqual(250);
	const polygonalSourcePixel = polygonalContext.getImageData(32, 32, 1, 1).data;
	expect([...polygonalSourcePixel]).toEqual([255, 255, 255, 255]);

	const outlineOnlyCanvas = await renderEffectChainToCanvas({
		source,
		width,
		height,
		effects: descriptorsToMemoizedEffects([
			outline({
				width: 6,
				edgeSimplification: 8,
				color: '#ff0000',
				outlineOnly: true,
			}),
		]),
	});
	const outlineOnlyContext = outlineOnlyCanvas.getContext('2d');
	if (!outlineOnlyContext) {
		throw new Error('Could not get outline-only output context');
	}

	const filledSourcePixel = outlineOnlyContext.getImageData(32, 32, 1, 1).data;
	expect([...filledSourcePixel]).toEqual([255, 0, 0, 255]);

	const filledOutlinePixel = outlineOnlyContext.getImageData(20, 32, 1, 1).data;
	expect(filledOutlinePixel[0]).toBeGreaterThanOrEqual(250);
	expect(filledOutlinePixel[1]).toBeLessThanOrEqual(5);
	expect(filledOutlinePixel[2]).toBeLessThanOrEqual(5);
	expect(filledOutlinePixel[3]).toBeGreaterThanOrEqual(250);

	const outlineOnlyTransparentPixel = outlineOnlyContext.getImageData(
		8,
		8,
		1,
		1,
	).data;
	expect([...outlineOnlyTransparentPixel]).toEqual([0, 0, 0, 0]);
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

test('levels() remaps endpoints and gamma while preserving alpha', async () => {
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
				51, 51, 51, 128, 128, 128, 128, 128, 204, 204, 204, 128,
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
		effects: descriptorsToMemoizedEffects([
			levels({blackPoint: 0.25, whitePoint: 0.75, gamma: 2}),
		]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixels = context.getImageData(0, 0, 3, 1).data;
	expect(pixels[0]).toBeLessThanOrEqual(1);
	expect(pixels[4]).toBeGreaterThanOrEqual(179);
	expect(pixels[4]).toBeLessThanOrEqual(182);
	expect(pixels[8]).toBeGreaterThanOrEqual(254);
	expect(pixels[3]).toBe(128);
	expect(pixels[7]).toBe(128);
	expect(pixels[11]).toBe(128);
});

test('shadowsHighlights() targets dark and bright tones smoothly', async () => {
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
				64, 64, 64, 128, 128, 128, 128, 128, 224, 224, 224, 128,
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
		effects: descriptorsToMemoizedEffects([
			shadowsHighlights({shadows: 1, highlights: -1}),
		]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixels = context.getImageData(0, 0, 3, 1).data;
	expect(pixels[0]).toBeGreaterThan(64);
	expect(pixels[4]).toBeGreaterThanOrEqual(126);
	expect(pixels[4]).toBeLessThanOrEqual(130);
	expect(pixels[8]).toBeLessThan(224);
	expect(pixels[3]).toBe(128);
	expect(pixels[7]).toBe(128);
	expect(pixels[11]).toBe(128);
});

test('colorCorrection() is neutral by default and matches standalone adjustments', async () => {
	const source = document.createElement('canvas');
	source.width = 3;
	source.height = 1;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	const sourcePixels = new Uint8ClampedArray([
		64, 96, 128, 255, 128, 128, 128, 255, 192, 128, 64, 255,
	]);
	sourceContext.putImageData(new ImageData(sourcePixels, 3, 1), 0, 0);

	const neutralCanvas = await renderEffectChainToCanvas({
		source,
		width: 3,
		height: 1,
		effects: descriptorsToMemoizedEffects([colorCorrection()]),
	});
	const neutralContext = neutralCanvas.getContext('2d');
	if (!neutralContext) {
		throw new Error('Could not get neutral output context');
	}

	expect([...neutralContext.getImageData(0, 0, 3, 1).data]).toEqual([
		...sourcePixels,
	]);

	const comparisons = [
		{
			combined: colorCorrection({exposure: 0.75}),
			standalone: exposure({stops: 0.75}),
		},
		{
			combined: colorCorrection({temperature: 0.6, tint: -0.3}),
			standalone: whiteBalance({temperature: 0.6, tint: -0.3}),
		},
		{
			combined: colorCorrection({shadows: 0.7, highlights: -0.4}),
			standalone: shadowsHighlights({shadows: 0.7, highlights: -0.4}),
		},
		{
			combined: colorCorrection({contrast: 1.4, pivot: 128 / 255}),
			standalone: contrast({amount: 1.4}),
		},
		{
			combined: colorCorrection({saturation: 0.4}),
			standalone: saturation({amount: 0.4}),
		},
		{
			combined: colorCorrection({vibrance: 0.5}),
			standalone: vibrance({amount: 0.5}),
		},
	];

	for (const {combined, standalone} of comparisons) {
		const combinedCanvas = await renderEffectChainToCanvas({
			source,
			width: 3,
			height: 1,
			effects: descriptorsToMemoizedEffects([combined]),
		});
		const standaloneCanvas = await renderEffectChainToCanvas({
			source,
			width: 3,
			height: 1,
			effects: descriptorsToMemoizedEffects([standalone]),
		});
		const combinedContext = combinedCanvas.getContext('2d');
		const standaloneContext = standaloneCanvas.getContext('2d');
		if (!combinedContext || !standaloneContext) {
			throw new Error('Could not get comparison output context');
		}

		const combinedPixels = combinedContext.getImageData(0, 0, 3, 1).data;
		const standalonePixels = standaloneContext.getImageData(0, 0, 3, 1).data;
		for (let index = 0; index < combinedPixels.length; index++) {
			expect(
				Math.abs(combinedPixels[index] - standalonePixels[index]),
			).toBeLessThanOrEqual(2);
		}
	}
});

test('colorCorrection() applies endpoint and combined adjustments in one pass', async () => {
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
				32, 32, 32, 128, 128, 96, 64, 128, 224, 224, 224, 128,
			]),
			3,
			1,
		),
		0,
		0,
	);

	const endpointCanvas = await renderEffectChainToCanvas({
		source,
		width: 3,
		height: 1,
		effects: descriptorsToMemoizedEffects([
			colorCorrection({blacks: 1, whites: -1}),
		]),
	});
	const endpointContext = endpointCanvas.getContext('2d');
	if (!endpointContext) {
		throw new Error('Could not get endpoint output context');
	}

	const endpointPixels = endpointContext.getImageData(0, 0, 3, 1).data;
	expect(endpointPixels[0]).toBeGreaterThan(32);
	expect(endpointPixels[8]).toBeLessThan(224);

	const towardEndpointCanvas = await renderEffectChainToCanvas({
		source,
		width: 3,
		height: 1,
		effects: descriptorsToMemoizedEffects([
			colorCorrection({blacks: -1, whites: 1}),
		]),
	});
	const towardEndpointContext = towardEndpointCanvas.getContext('2d');
	if (!towardEndpointContext) {
		throw new Error('Could not get toward-endpoint output context');
	}

	const towardEndpointPixels = towardEndpointContext.getImageData(
		0,
		0,
		3,
		1,
	).data;
	expect(towardEndpointPixels[0]).toBeLessThan(32);
	expect(towardEndpointPixels[8]).toBeGreaterThan(224);
	expect(towardEndpointPixels[3]).toBe(128);
	expect(towardEndpointPixels[7]).toBe(128);
	expect(towardEndpointPixels[11]).toBe(128);

	const combinedCanvas = await renderEffectChainToCanvas({
		source,
		width: 3,
		height: 1,
		effects: descriptorsToMemoizedEffects([
			colorCorrection({
				exposure: 0.25,
				contrast: 1.15,
				pivot: 0.45,
				shadows: 0.3,
				highlights: -0.2,
				whites: 0.25,
				blacks: 0.15,
				temperature: 0.2,
				tint: -0.1,
				saturation: 0.9,
				vibrance: 0.25,
			}),
		]),
	});
	const combinedContext = combinedCanvas.getContext('2d');
	if (!combinedContext) {
		throw new Error('Could not get combined output context');
	}

	const combinedPixels = combinedContext.getImageData(0, 0, 3, 1).data;
	expect([...combinedPixels]).not.toEqual([
		32, 32, 32, 128, 128, 96, 64, 128, 224, 224, 224, 128,
	]);
	expect(combinedPixels[3]).toBe(128);
	expect(combinedPixels[7]).toBe(128);
	expect(combinedPixels[11]).toBe(128);
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

test('tile() mirrors neighboring copies on both axes without seams', async () => {
	const source = document.createElement('canvas');
	source.width = 6;
	source.height = 6;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.putImageData(
		new ImageData(
			new Uint8ClampedArray([
				255, 0, 0, 128, 0, 255, 0, 128, 0, 0, 255, 128, 255, 255, 0, 128,
			]),
			2,
			2,
		),
		2,
		2,
	);

	const canvas = await renderEffectChainToCanvas({
		source,
		width: 6,
		height: 6,
		effects: descriptorsToMemoizedEffects([tile()]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixels = context.getImageData(0, 0, 6, 6).data;
	const colors = [];
	const alphas = [];
	for (let i = 0; i < pixels.length; i += 4) {
		colors.push(`${pixels[i]}-${pixels[i + 1]}-${pixels[i + 2]}`);
		alphas.push(pixels[i + 3]);
	}

	const red = '255-0-0';
	const green = '0-255-0';
	const blue = '0-0-255';
	const yellow = '255-255-0';
	expect(colors).toEqual(
		[
			[yellow, blue, blue, yellow, yellow, blue],
			[green, red, red, green, green, red],
			[green, red, red, green, green, red],
			[yellow, blue, blue, yellow, yellow, blue],
			[yellow, blue, blue, yellow, yellow, blue],
			[green, red, red, green, green, red],
		].flat(),
	);
	expect(alphas).toEqual(new Array(36).fill(128));
});

test('tile() does not leave transparent seams after scale()', async () => {
	const width = 20;
	const height = 20;
	const source = document.createElement('canvas');
	source.width = width;
	source.height = height;
	const sourceContext = source.getContext('2d');
	if (!sourceContext) {
		throw new Error('Could not get source context');
	}

	sourceContext.fillStyle = 'red';
	sourceContext.fillRect(0, 0, width, height);

	const canvas = await renderEffectChainToCanvas({
		source,
		width,
		height,
		effects: descriptorsToMemoizedEffects([scale({scale: 0.36}), tile()]),
	});
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get output context');
	}

	const pixels = context.getImageData(0, 0, width, height).data;
	const alphas = [];
	for (let i = 3; i < pixels.length; i += 4) {
		alphas.push(pixels[i]);
	}

	expect(alphas).toEqual(new Array(width * height).fill(255));
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
