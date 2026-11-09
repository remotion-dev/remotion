import {AbsoluteFill} from 'remotion';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {maskImageUrl} from './fixtures/mask-image-url';
import {rasterMask} from './fixtures/mask-image-url-sizing';
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
