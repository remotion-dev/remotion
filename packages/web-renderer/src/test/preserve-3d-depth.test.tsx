import {Thumbnail} from '@remotion/player';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {page, server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {FallbackDepthScene, size} from './fixtures/preserve-3d-depth';

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
		'magnified-mask',
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
		if (kind === 'magnified-mask' || kind === 'soft-inset') {
			for (let i = 0; i < native.length; i += 4)
				for (let c = 0; c < 3; c++)
					delta += Math.abs(native[i + c] - fallback[i + c]);
			expect(delta / (640 * 480 * 3)).toBeLessThan(
				kind === 'magnified-mask' ? 0.4 : 1.5,
			);
		}
	} finally {
		root.unmount();
		container.remove();
		cleanupCSS();
	}
});
