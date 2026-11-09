import {Thumbnail} from '@remotion/player';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {page, server} from 'vitest/browser';
import {calculateTransforms} from '../drawing/calculate-transforms';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb, renderFramesOnWeb} from '../render-still-on-web';
import {FallbackDepthScene, size} from './fixtures/preserve-3d-depth';
import '../symbol-dispose';
import {captureNativeReference, compareNativePixels} from './native-reference';

const pixels = async (blob: Blob) => {
	const image = await createImageBitmap(blob);
	try {
		expect(image.width).toBe(size.width);
		expect(image.height).toBe(size.height);
		const context = new OffscreenCanvas(size.width, size.height).getContext(
			'2d',
		)!;
		context.drawImage(image, 0, 0);
		return context.getImageData(0, 0, size.width, size.height).data;
	} finally {
		image.close();
	}
};

// Reduced from a real export regression (kino-ai/kino#4950). Compare against
// this browser's native compositor; exclude raster edges from geometry checks.
// This native-reference harness targets the Chromium/Electron regression.
// Native 3D/raster behavior in Firefox and WebKit needs separate qualification.
test
	.skipIf(server.browser !== 'chromium')
	.each([
		'zero-flat',
		'coplanar-delay',
		'soft-inset',
		'implicit-gradient-stop',
		'trailing-gradient-stop',
		'perspective',
		'depth',
		'group',
		'offscreen',
		'oversized-opacity',
		'opacity-paint-bounds',
		'local-group-depth',
	])('%s preserves native projection and grouping', async (kind) => {
	await page.viewport(640, 480);
	const container = document.createElement('div');
	container.dataset.testid = 'native-depth';
	container.className = 'native-depth';
	const cleanupCSS = Internals.CSSUtils.injectCSS(
		Internals.CSSUtils.makeDefaultPreviewCSS('.native-depth', 'white'),
	);
	Object.assign(container.style, {width: '640px', height: '480px'});
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		flushSync(() =>
			root.render(
				<Thumbnail
					component={FallbackDepthScene}
					compositionWidth={640}
					compositionHeight={480}
					frameToDisplay={0}
					durationInFrames={1}
					fps={30}
					inputProps={{kind}}
					style={size}
				/>,
			),
		);
		await document.fonts.ready;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
		const reference = await page
			.getByTestId('native-depth')
			.screenshot({save: false});
		const native = await pixels(
			await (await fetch(`data:image/png;base64,${reference}`)).blob(),
		);
		const fallback = await pixels(
			await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: {
						id: 'fallback-depth',
						component: FallbackDepthScene,
						...size,
						fps: 30,
						durationInFrames: 1,
						defaultProps: {kind},
					},
					frame: 0,
					inputProps: {kind},
					allowHtmlInCanvas: false,
					experimental3DRendering: true,
				})
			).blob({format: 'png'}),
		);
		let samples = 0;
		let coloredSamples = 0;
		let bad = 0;
		let delta = 0;
		for (let y = 2; y < 478; y++)
			for (let x = 2; x < 638; x++) {
				const i = (y * 640 + x) * 4;
				let flat = true;
				for (const dy of [-2, 0, 2])
					for (const dx of [-2, 0, 2])
						for (let c = 0; c < 3; c++) {
							if (
								Math.abs(
									native[i + c] - native[((y + dy) * 640 + x + dx) * 4 + c],
								) > 2
							)
								flat = false;
						}

				if (!flat) continue;
				samples++;
				if (
					Math.max(native[i], native[i + 1], native[i + 2]) -
						Math.min(native[i], native[i + 1], native[i + 2]) >
					50
				)
					coloredSamples++;
				if (
					[0, 1, 2].some((c) => Math.abs(native[i + c] - fallback[i + c]) > 8)
				)
					bad++;
			}

		expect(samples).toBeGreaterThan(20000);
		expect(coloredSamples).toBeGreaterThan(1000);
		expect(bad / samples).toBeLessThan(0.005);
		if (kind === 'soft-inset') {
			for (let i = 0; i < native.length; i += 4)
				for (let c = 0; c < 3; c++)
					delta += Math.abs(native[i + c] - fallback[i + c]);
			expect(delta / (640 * 480 * 3)).toBeLessThan(1.5);
		}
	} finally {
		root.unmount();
		container.remove();
		cleanupCSS();
	}
});

// KINO-7765: each public render API must own its 3D policy without a global flag.
test.skipIf(server.browser !== 'chromium')(
	'3D policy belongs to each still, batch and media render',
	async () => {
		const composition = {
			id: '3d-render-policy',
			component: FallbackDepthScene,
			...size,
			fps: 30,
			durationInFrames: 2,
			defaultProps: {kind: 'depth'},
		};
		const options = {
			composition,
			inputProps: {kind: 'depth'},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const disabled = await pixels(
			await (
				await renderStillOnWeb({
					...options,
					frame: 0,
					experimental3DRendering: false,
				})
			).blob({format: 'png'}),
		);
		const defaultResult = await pixels(
			await (await renderStillOnWeb({...options, frame: 0})).blob({
				format: 'png',
			}),
		);
		expect(defaultResult).toEqual(disabled);
		const batch = await renderFramesOnWeb({
			...options,
			frames: [0, 1],
			experimental3DRendering: true,
		});
		const index = (220 * 640 + 300) * 4;
		for (const still of batch) {
			const data = await pixels(await still.blob({format: 'png'}));
			expect(Array.from(data.slice(index, index + 3))).toEqual([34, 221, 68]);
			expect(Array.from(disabled.slice(index, index + 3))).not.toEqual([
				34, 221, 68,
			]);
		}

		let capturedFrames = 0;
		const media = await renderMediaOnWeb({
			...options,
			container: 'mp4',
			videoCodec: 'h264',
			audioCodec: null,
			muted: true,
			experimental3DRendering: true,
			onFrame: (frame) => {
				const canvas = new OffscreenCanvas(640, 480);
				const context = canvas.getContext('2d')!;
				context.drawImage(frame, 0, 0);
				expect(
					Array.from(context.getImageData(300, 220, 1, 1).data.slice(0, 3)),
				).toEqual([34, 221, 68]);
				capturedFrames++;
				return frame;
			},
		});
		expect(capturedFrames).toBe(2);
		expect((await media.getBlob()).size).toBeGreaterThan(0);
	},
);

const reviewComposition = (kind: string) => ({
	id: `3d-${kind}`,
	component: () => <FallbackDepthScene kind={kind} />,
	...size,
	fps: 30,
	durationInFrames: 1,
});

test('keeps unsupported inset shadows disabled on the default path', async () => {
	const control = await (
		await renderStillOnWeb({
			composition: reviewComposition('review-inset-control'),
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	for (const experimental3DRendering of [undefined, false]) {
		const actual = await (
			await renderStillOnWeb({
				composition: reviewComposition('review-inset'),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				experimental3DRendering,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(control, actual)).mismatchedPixels).toBe(
			0,
		);
	}
});

test.skipIf(server.browser !== 'chromium')(
	'keeps experimental sharp inset shadows native-exact',
	async () => {
		const composition = reviewComposition('review-inset');
		const native = await captureNativeReference(composition);
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				experimental3DRendering: true,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);

test.skipIf(server.browser !== 'chromium')(
	'retains the blur footprint when opacity requires a layer',
	async () => {
		const options = {
			composition: reviewComposition('review-blur'),
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const control = await pixels(
			await (
				await renderStillOnWeb({...options, experimental3DRendering: false})
			).blob({format: 'png'}),
		);
		const actual = await pixels(
			await (
				await renderStillOnWeb({...options, experimental3DRendering: true})
			).blob({format: 'png'}),
		);
		// Full native .5 comparisons remain a separate exact diagnostic; Canvas
		// compositing still differs by one channel value on an opaque backdrop.
		for (const [x, y] of [
			[95, 150],
			[205, 150],
			[150, 95],
			[150, 205],
		]) {
			const offset = (y * size.width + x) * 4;
			expect(Array.from(actual.slice(offset, offset + 4))).toEqual(
				Array.from(control.slice(offset, offset + 4)),
			);
		}
	},
);

test.skipIf(server.browser !== 'chromium')(
	'preserves explicitly inherited opacity inside a blended group',
	async () => {
		const composition = reviewComposition('review-blend-inherit');
		const native = await captureNativeReference(composition);
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				experimental3DRendering: true,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);

// Opacity 0.4 maps to integer 8-bit coverage. The original .5 full-native scene remains an
// unchanged diagnostic for the separate opaque-backdrop channel gap.
test.skipIf(server.browser !== 'chromium')(
	'projects translucent 2D layers into the viewport without clipping',
	async () => {
		const composition = reviewComposition('review-projected-exact');
		const native = await captureNativeReference(composition);
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				experimental3DRendering: true,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);

test('restores authored opacity and priority after 3D planning', () => {
	const root = document.createElement('div');
	const child = document.createElement('div');
	Object.assign(root.style, {
		position: 'fixed',
		left: '0',
		top: '0',
		width: '200px',
		height: '200px',
		transformStyle: 'preserve-3d',
	});
	Object.assign(child.style, {
		width: '100px',
		height: '100px',
		mixBlendMode: 'multiply',
	});
	child.style.setProperty('opacity', '.5', 'important');
	root.appendChild(child);
	document.body.appendChild(root);
	try {
		{
			using plan = calculateTransforms({
				element: child,
				rootElement: root,
				transformStyleCache: new WeakMap(),
				isolated: false,
				experimental3DRendering: true,
			});
			expect(plan.opacity).toBe(0.5);
		}

		expect(child.style.opacity).toBe('0.5');
		expect(child.style.getPropertyPriority('opacity')).toBe('important');
	} finally {
		root.remove();
	}
});
