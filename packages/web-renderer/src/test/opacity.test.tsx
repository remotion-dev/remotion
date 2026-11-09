import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {opacityNested} from './fixtures/opacity-nested';
import {opacitySimple} from './fixtures/opacity-simple';
import {opacityZero} from './fixtures/opacity-zero';
import {svgRootOpacity} from './fixtures/svg-root-opacity';
import {threeDTransformOpacity} from './fixtures/three-d-transform-opacity';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test('should apply simple opacity', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: opacitySimple,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'opacity-simple', threshold: 0.02});
});

test('should apply nested opacity (multiply parent and child)', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: opacityNested,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'opacity-nested', threshold: 0.02});
});

test('should render with zero opacity (opacity: 0)', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: opacityZero,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'opacity-zero', threshold: 0.02});
});

test('should apply opacity with 3D transform (rotateX)', async () => {
	page.viewport(200, 200);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: threeDTransformOpacity,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'three-d-transform-opacity', threshold: 0.02});
});

// KINO-7774: the SVG image and composer both applied the root's opacity.
for (const frame of [0, 1]) {
	test(`applies SVG root opacity once at frame ${frame}`, async (t) => {
		await page.viewport(1280, 720);
		const actual = await (
			await renderStillOnWeb({
				composition: svgRootOpacity,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const bitmap = await createImageBitmap(actual);
		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const context = canvas.getContext('2d')!;
		try {
			context.drawImage(bitmap, 0, 0);
		} finally {
			bitmap.close();
		}

		const expectedAlpha = [
			frame === 0 ? 128 : 64,
			128,
			64,
			64,
			0,
			128,
			128,
			255,
			128,
			64,
			32,
		];
		const pixels = expectedAlpha.map((_, index) =>
			Array.from(context.getImageData(40 + index * 90, 40, 1, 1).data),
		);
		if (t.task.file.projectName !== 'firefox') {
			const native = await captureNativeReference(svgRootOpacity, frame);
			const diff = await compareNativePixels(native, actual);
			if (diff.mismatchedPixels !== 0) {
				await Promise.all([
					savePixelEvidence(native, `svg-root-opacity-${frame}-native`),
					savePixelEvidence(actual, `svg-root-opacity-${frame}-actual`),
					savePixelEvidence(diff.diff, `svg-root-opacity-${frame}-diff`),
				]);
			}

			expect(diff.mismatchedPixels).toBe(0);
		}

		expect(pixels).toEqual(
			expectedAlpha.map((alpha) =>
				alpha === 0 ? [0, 0, 0, 0] : [255, 0, 0, alpha],
			),
		);
	});
}
