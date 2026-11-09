import {Thumbnail} from '@remotion/player';
import {ALL_FORMATS, BlobSource, Input} from 'mediabunny';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {page, server} from 'vitest/browser';
import {calculateTransforms} from '../drawing/calculate-transforms';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb, renderFramesOnWeb} from '../render-still-on-web';
import {
	FallbackDepthScene,
	size,
	reviewSceneSize,
} from './fixtures/preserve-3d-depth';
import '../symbol-dispose';
import {captureNativeReference, compareNativePixels} from './native-reference';

const pixels = async (blob: Blob, dimensions = size) => {
	const image = await createImageBitmap(blob);
	try {
		expect(image.width).toBe(dimensions.width);
		expect(image.height).toBe(dimensions.height);
		const context = new OffscreenCanvas(
			dimensions.width,
			dimensions.height,
		).getContext('2d')!;
		context.drawImage(image, 0, 0);
		return context.getImageData(0, 0, dimensions.width, dimensions.height).data;
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
	async (t) => {
		const startedAt = performance.now();
		let phase = 'disabled still';
		t.onTestFailed(() => {
			Internals.Log.error(
				{logLevel: 'error', tag: '@remotion/web-renderer'},
				`3D render policy: ${phase}, ${Math.round(performance.now() - startedAt)}ms elapsed`,
			);
		});
		// This smoke checks option ownership; native geometry remains covered at 640x480 above.
		const outputSize = {width: 160, height: 120};
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
			scale: 0.25,
		} as const;
		const disabled = await pixels(
			await (
				await renderStillOnWeb({
					...options,
					frame: 0,
					experimental3DRendering: false,
				})
			).blob({format: 'png'}),
			outputSize,
		);
		phase = 'default still';
		const defaultResult = await pixels(
			await (await renderStillOnWeb({...options, frame: 0})).blob({
				format: 'png',
			}),
			outputSize,
		);
		expect(defaultResult).toEqual(disabled);
		phase = 'enabled batch';
		const batch = await renderFramesOnWeb({
			...options,
			frames: [0, 1],
			experimental3DRendering: true,
		});
		const index = (55 * outputSize.width + 75) * 4;
		for (const still of batch) {
			const data = await pixels(await still.blob({format: 'png'}), outputSize);
			expect(Array.from(data.slice(index, index + 3))).toEqual([34, 221, 68]);
			expect(Array.from(disabled.slice(index, index + 3))).not.toEqual([
				34, 221, 68,
			]);
		}

		phase = 'enabled media';
		let capturedFrames = 0;
		const media = await renderMediaOnWeb({
			...options,
			container: 'mp4',
			videoCodec: 'h264',
			audioCodec: null,
			muted: true,
			experimental3DRendering: true,
			onFrame: (frame) => {
				expect(frame.displayWidth).toBe(outputSize.width);
				expect(frame.displayHeight).toBe(outputSize.height);
				const canvas = new OffscreenCanvas(outputSize.width, outputSize.height);
				const context = canvas.getContext('2d')!;
				context.drawImage(frame, 0, 0);
				expect(
					Array.from(context.getImageData(75, 55, 1, 1).data.slice(0, 3)),
				).toEqual([34, 221, 68]);
				capturedFrames++;
				return frame;
			},
		});
		expect(capturedFrames).toBe(2);

		phase = 'encoded media dimensions';
		const blob = await media.getBlob();
		expect(blob.size).toBeGreaterThan(0);
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(blob),
		});
		const track = await input.getPrimaryVideoTrack();
		expect(track).not.toBeNull();
		expect(track!.displayWidth).toBe(outputSize.width);
		expect(track!.displayHeight).toBe(outputSize.height);
	},
);

const reviewComposition = (kind: string) => ({
	id: `3d-${kind}`,
	component: () => <FallbackDepthScene kind={kind} />,
	...reviewSceneSize(kind),
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
		const native = await pixels(
			await captureNativeReference(options.composition, 0, {
				omitBackground: false,
			}),
		);
		const actual = await pixels(
			await (
				await renderStillOnWeb({...options, experimental3DRendering: true})
			).blob({format: 'png'}),
		);
		// Keep all four halo samples tied to browser painting. The full-frame
		// native diagnostic remains separately inexact on the opaque backdrop.
		for (const [x, y] of [
			[95, 150],
			[205, 150],
			[150, 95],
			[150, 205],
		]) {
			const offset = (y * size.width + x) * 4;
			expect(Array.from(actual.slice(offset, offset + 4))).toEqual(
				Array.from(native.slice(offset, offset + 4)),
			);
		}
	},
);

// Producer equivalence protects inherited opacity/culling without claiming that
// the separately retained native opaque-backdrop rounding diagnostic is repaired.
for (const [kind, controlKind] of [
	['review-blend-inherit', 'review-blend-explicit'],
	['review-projected-exact', 'review-projected-visible-exact'],
] as const) {
	test(`preserves render bytes for ${kind} against equivalent explicit geometry`, async () => {
		const rendered = await Promise.all(
			[kind, controlKind].map(async (selected) =>
				(
					await renderStillOnWeb({
						composition: reviewComposition(selected),
						frame: 0,
						inputProps: {},
						licenseKey: 'free-license',
						allowHtmlInCanvas: false,
						experimental3DRendering: true,
					})
				).blob({format: 'png'}),
			),
		);
		expect(
			(await compareNativePixels(rendered[0], rendered[1])).mismatchedPixels,
		).toBe(0);
	});
}

for (const [kind, x, y, color] of [
	['review-eye-plane', 150, 250, [0, 255, 0, 255]],
	['review-descendant-blur', 95, 150, null],
	['review-offscreen-filter', 75, 125, [0, 0, 255, 255]],
] as const) {
	test.skipIf(server.browser !== 'chromium')(
		`${kind} retains the reported visible filter or projection output`,
		async () => {
			const composition = reviewComposition(kind);
			const actual = await pixels(
				await (
					await renderStillOnWeb({
						composition,
						frame: 0,
						inputProps: {},
						licenseKey: 'free-license',
						allowHtmlInCanvas: false,
						experimental3DRendering: true,
					})
				).blob({format: 'png'}),
				composition,
			);
			const reference = await pixels(
				// Preserve the default blur footprint; its full native channel diagnostic remains open.
				kind === 'review-descendant-blur'
					? await (
							await renderStillOnWeb({
								composition,
								frame: 0,
								inputProps: {},
								licenseKey: 'free-license',
								allowHtmlInCanvas: false,
								experimental3DRendering: false,
							})
						).blob({format: 'png'})
					: await captureNativeReference(composition),
				composition,
			);
			const offset = (y * composition.width + x) * 4;
			if (color !== null)
				expect(Array.from(reference.slice(offset, offset + 4))).toEqual(color);
			expect(Array.from(actual.slice(offset, offset + 4))).toEqual(
				Array.from(reference.slice(offset, offset + 4)),
			);
		},
	);
}

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
