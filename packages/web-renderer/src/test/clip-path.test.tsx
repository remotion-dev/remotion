import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {clipPathCircle} from './fixtures/clip-path-circle';
import {clipPathEllipse} from './fixtures/clip-path-ellipse';
import {clipPathInset} from './fixtures/clip-path-inset';
import {clipPathPath} from './fixtures/clip-path-path';
import {clipPathPolygon} from './fixtures/clip-path-polygon';
import {clipPathReference} from './fixtures/clip-path-reference';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test('Should render clip-path: polygon()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPolygon,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-polygon',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: path()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPath,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-path',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: circle()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathCircle,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-circle',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: inset()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathInset,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-inset',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: ellipse()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathEllipse,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-ellipse',
		allowedMismatchedPixelRatio: 0.02,
	});
});

// KINO-7772: referenced SVG clip paths were ignored by the DOM composer.
for (const frame of [0, 1]) {
	test(`local SVG rectangles clip all descendants at frame ${frame}`, async (t) => {
		if (t.task.file.projectName === 'firefox') {
			// Native transparent element capture is unsupported in this engine.
			t.skip();
			return;
		}

		const reference = await captureNativeReference(clipPathReference, frame);
		const actual = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: clipPathReference,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const diff = await compareNativePixels(reference, actual);
		await Promise.all([
			savePixelEvidence(reference, `clip-reference-${frame}-native`),
			savePixelEvidence(actual, `clip-reference-${frame}-actual`),
			savePixelEvidence(diff.diff, `clip-reference-${frame}-diff`),
		]);
		expect(diff.mismatchedPixels).toBe(0);
	});
}
