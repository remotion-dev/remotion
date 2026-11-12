import {afterAll, afterEach, expect, mock, test} from 'bun:test';
import type {EffectCatalogItem} from '@remotion/studio-shared';

const createEffectChainState = mock(() => ({}));
const cleanupEffectChainState = mock(() => undefined);
const runEffectChain = mock(async (_options: unknown) => true);
const factory = mock(() => ({}));

const actual = await import('remotion');
mock.module('remotion', () => ({
	...actual,
	Internals: {
		...actual.Internals,
		createEffectChainState,
		cleanupEffectChainState,
		runEffectChain,
	},
}));
mock.module('../components/effect-preview-loaders', () => ({
	effectPreviewLoaders: {
		'@remotion/effects/blur': async () => ({blur: factory}),
	},
}));

const {renderEffectThumbnail, getCachedEffectThumbnail} =
	await import('../components/render-effect-thumbnail');
afterAll(() => mock.restore());

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
	mock.clearAllMocks();
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
		expect(createEffectChainState).toHaveBeenCalledWith(width, height);
		expect(factory).toHaveBeenCalledWith({radius: 40});
		expect(runEffectChain).toHaveBeenCalledWith(
			expect.objectContaining({
				width,
				height,
				source: expect.objectContaining({width, height}),
			}),
		);
		expect(thumbnail).toMatchObject({
			width: thumbnailWidth,
			height: thumbnailHeight,
		});
		const options = runEffectChain.mock.calls[0][0] as {
			output: HTMLCanvasElement;
		};
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
