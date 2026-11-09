import {AbsoluteFill} from 'remotion';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {legacyMaskComposites} from './fixtures/mask-image-legacy-composite';
import '../symbol-dispose';
import {unsupportedMaskImages} from './fixtures/mask-image-unsupported';
import {maskImageUrl} from './fixtures/mask-image-url';
import {rasterMask} from './fixtures/mask-image-url-sizing';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testImage} from './utils';

test('renders a same-origin raster URL mask', async () => {
	await page.viewport(500, 180);
	const blob = await (
		await renderStillOnWeb({
			composition: maskImageUrl,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'mask-image-url', threshold: 0.02});
});

test('renders a same-origin raster URL mask at a higher scale', async () => {
	await page.viewport(1000, 360);
	const blob = await (
		await renderStillOnWeb({
			composition: maskImageUrl,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			scale: 2,
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'mask-image-url-scaled', threshold: 0.02});
});

test.for([
	'url("https://example.com/mask.png")',
	'none, url("https://example.com/mask.png")',
	'url("https://example.com/linear-gradient(red,blue).png")',
	'none, url("https://example.com/linear-gradient(red,blue).png")',
])('rejects a cross-origin URL mask: %s', async (maskImage) => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
					maskImage,
					maskPosition: '0% 0%',
					maskRepeat: 'no-repeat',
					maskSize: '100% 100%',
				}}
			/>
		);
	};

	await expect(
		renderStillOnWeb({
			composition: {
				component: Component,
				durationInFrames: 1,
				fps: 25,
				height: 100,
				id: 'remote-mask-image-url',
				width: 100,
			},
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		}),
	).rejects.toThrow(
		'@remotion/web-renderer only supports same-origin, data:, and blob: mask-image URLs.',
	);
});

// KINO-7771: a failed mask layer must release another layer's late bitmap.
test('closes a late raster decode when another mask layer fails', async () => {
	let signalDecoded!: () => void;
	const decoded = new Promise<void>((resolve) => {
		signalDecoded = resolve;
	});
	let releaseDecode!: () => void;
	const held = new Promise<void>((resolve) => {
		releaseDecode = resolve;
	});
	const decode = window.createImageBitmap.bind(window);
	const fetch = window.fetch.bind(window);
	const failure = new URL(
		'/__mask_resource_failure__.png',
		window.location.origin,
	).href;
	let bitmap: ImageBitmap | null = null;
	const decodeSpy = vi
		.spyOn(window, 'createImageBitmap')
		.mockImplementation(async (source: ImageBitmapSource) => {
			const image = await decode(source);
			bitmap = image;
			signalDecoded();
			await held;
			return image;
		});
	const fetchSpy = vi
		.spyOn(window, 'fetch')
		.mockImplementation(async (input, init) => {
			if (String(input) !== failure) return fetch(input, init);
			await decoded;
			return new Response('', {
				status: 500,
				statusText: 'Mask fixture failure',
			});
		});
	const Component = () => (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
				maskImage: `url("${rasterMask}"), url("${failure}")`,
				maskSize: '16px 8px',
				maskRepeat: 'no-repeat',
			}}
		/>
	);
	try {
		await expect(
			renderStillOnWeb({
				composition: {
					component: Component,
					id: 'mask-resource-failure',
					width: 100,
					height: 100,
					fps: 25,
					durationInFrames: 1,
				},
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			}),
		).rejects.toThrow('HTTP 500');
		releaseDecode();
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		expect(bitmap!.width).toBe(0);
	} finally {
		releaseDecode();
		decodeSpy.mockRestore();
		fetchSpy.mockRestore();
		(bitmap as ImageBitmap | null)?.close();
	}
});

test('loads a PNG URL containing gradient syntax through the raster loader', async () => {
	const source = new URL(
		'/mask-linear-gradient(red,blue).png',
		document.baseURI,
	).href;
	const fetch = window.fetch.bind(window);
	let requests = 0;
	const spy = vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
		if (String(input) === source) requests++;
		return fetch(input, init);
	});
	const Component = () => (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
				maskImage: `url("${source}"), none`,
				maskSize: '16px 8px',
				maskRepeat: 'no-repeat',
			}}
		/>
	);
	try {
		await (
			await renderStillOnWeb({
				composition: {
					component: Component,
					id: 'mask-url-gradient-token',
					width: 40,
					height: 24,
					fps: 25,
					durationInFrames: 1,
				},
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		expect(requests).toBe(1);
	} finally {
		spy.mockRestore();
	}
});

// KINO-7771 / PR13129: computed legacy keywords must not silently become add.
for (const {composition, composite} of legacyMaskComposites) {
	test(`preserves normalized or rejects ${composition.id}`, async (t) => {
		if (!CSS.supports('-webkit-mask-composite', composite)) {
			t.skip();
			return;
		}

		const probe = document.createElement('div');
		probe.style.setProperty('-webkit-mask-composite', composite);
		document.body.appendChild(probe);
		const computed = getComputedStyle(probe).maskComposite;
		probe.remove();
		const options = {
			composition,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		};
		if (CSS.supports('mask-composite', computed)) {
			const native = await captureNativeReference(composition);
			const actual = await (
				await renderStillOnWeb(options)
			).blob({format: 'png'});
			expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
		} else {
			await expect(renderStillOnWeb(options)).rejects.toThrow(
				'Unsupported mask-composite value:',
			);
		}
	});
}

// KINO-7771: nested gradient text must not admit unsupported source functions.
for (const {composition, maskImage} of unsupportedMaskImages) {
	test(`rejects ${composition.id}`, async (t) => {
		if (!CSS.supports('mask-image', maskImage)) {
			t.skip();
			return;
		}

		await expect(
			renderStillOnWeb({
				composition,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			}),
		).rejects.toThrow(/mask-image/);
	});
}
