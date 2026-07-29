import {AbsoluteFill} from 'remotion';
import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {maskImageUrl} from './fixtures/mask-image-url';
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

test('rejects a cross-origin URL mask', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
					maskImage: 'url("https://example.com/mask.png")',
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
