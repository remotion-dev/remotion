import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import assert from 'node:assert/strict';
import type {EffectCatalogItem} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {
	getCachedEffectThumbnail,
	renderEffectThumbnail,
} from '../components/render-effect-thumbnail';

const originalDocument = Object.getOwnPropertyDescriptor(
	globalThis,
	'document',
);
const originalRaf = Object.getOwnPropertyDescriptor(
	globalThis,
	'requestAnimationFrame',
);

afterEach(() => {
	for (const [key, descriptor] of [
		['document', originalDocument],
		['requestAnimationFrame', originalRaf],
	] as const) {
		if (descriptor) {
			Object.defineProperty(globalThis, key, descriptor);
		} else {
			Reflect.deleteProperty(globalThis, key);
		}
	}

	mock.restore();
});

const item: EffectCatalogItem = {
	id: 'effects-blur',
	category: 'Blur & Shadow',
	label: 'blur()',
	description: 'Gaussian blur effect',
	effect: {
		name: 'blur',
		importPath: '@remotion/effects/blur',
		config: {radius: 40},
	},
};

for (const [width, height, thumbnailWidth, thumbnailHeight] of [
	[1920, 1080, 320, 180],
	[1080, 1920, 180, 320],
	[160, 90, 160, 90],
]) {
	test(`renders effects at ${width}x${height} before resizing the thumbnail`, async () => {
		const createEffectChainState = spyOn(Internals, 'createEffectChainState');
		const cleanupEffectChainState = spyOn(Internals, 'cleanupEffectChainState');
		const runEffectChain = spyOn(Internals, 'runEffectChain').mockResolvedValue(
			true,
		);
		const draws: {canvas: HTMLCanvasElement; args: unknown[]}[] = [];
		Object.defineProperty(globalThis, 'document', {
			configurable: true,
			value: {
				createElement: () => {
					const canvas = {
						width: 0,
						height: 0,
						getContext: () => ({
							drawImage: (...args: unknown[]) =>
								draws.push({
									canvas: canvas as unknown as HTMLCanvasElement,
									args,
								}),
						}),
					};
					return canvas;
				},
			},
		});
		Object.defineProperty(globalThis, 'requestAnimationFrame', {
			configurable: true,
			value: (callback: FrameRequestCallback) => callback(0),
		});
		const snapshot = {width, height} as HTMLCanvasElement;
		const thumbnail = await renderEffectThumbnail({
			snapshot,
			item,
			signal: new AbortController().signal,
		});
		assert(thumbnail);
		expect(createEffectChainState).toHaveBeenCalledWith(width, height);
		expect(runEffectChain).toHaveBeenCalledWith(
			expect.objectContaining({
				width,
				height,
				source: expect.objectContaining({width, height}),
				effects: [
					expect.objectContaining({
						params: expect.objectContaining({radius: 40}),
					}),
				],
			}),
		);
		expect(thumbnail).toMatchObject({
			width: thumbnailWidth,
			height: thumbnailHeight,
		});
		const options = runEffectChain.mock.calls[0][0];
		expect(draws).toContainEqual({
			canvas: thumbnail,
			args: [options.output, 0, 0, thumbnailWidth, thumbnailHeight],
		});
		expect(options.output).toMatchObject({width: 0, height: 0});
		expect(cleanupEffectChainState).toHaveBeenCalledTimes(1);
		expect(getCachedEffectThumbnail(snapshot, item.id)).toBe(thumbnail);
		expect(
			await renderEffectThumbnail({
				snapshot,
				item,
				signal: new AbortController().signal,
			}),
		).toBe(thumbnail);
		expect(runEffectChain).toHaveBeenCalledTimes(1);
	});
}
