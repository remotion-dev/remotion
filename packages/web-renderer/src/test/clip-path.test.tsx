import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {parseClipPath} from '../drawing/clip-path';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {clipPathCircle} from './fixtures/clip-path-circle';
import {clipPathEllipse} from './fixtures/clip-path-ellipse';
import {clipPathInset} from './fixtures/clip-path-inset';
import {clipPathPath} from './fixtures/clip-path-path';
import {clipPathPolygon} from './fixtures/clip-path-polygon';
import {clipPathPolygonFillRules} from './fixtures/clip-path-polygon-fill-rules';
import {clipPathRectangleUnion} from './fixtures/clip-path-rectangle-union';
import {clipPathReference} from './fixtures/clip-path-reference';
import {clipPathShapeReference} from './fixtures/clip-path-shape-reference';
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
for (const {fixture, frame} of [
	clipPathReference,
	clipPathShapeReference,
	clipPathRectangleUnion,
].flatMap((selectedFixture) =>
	[0, 1].map((selectedFrame) => ({
		fixture: selectedFixture,
		frame: selectedFrame,
	})),
)) {
	test(`${fixture.id} clips all descendants at frame ${frame}`, async (t) => {
		if (t.task.file.projectName === 'firefox') {
			// Native transparent element capture is unsupported in this engine.
			t.skip();
			return;
		}

		const stageStart = performance.now();
		Internals.Log.info(
			{logLevel: 'info', tag: 'clip-parity-ci'},
			'clip-parity native:start',
			fixture.id,
			frame,
		);
		const reference = await captureNativeReference(fixture, frame);
		Internals.Log.info(
			{logLevel: 'info', tag: 'clip-parity-ci'},
			'clip-parity native:end',
			fixture.id,
			frame,
			performance.now() - stageStart,
		);
		const actual = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: fixture,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		Internals.Log.info(
			{logLevel: 'info', tag: 'clip-parity-ci'},
			'clip-parity render:end',
			fixture.id,
			frame,
			performance.now() - stageStart,
		);
		const diff = await compareNativePixels(reference, actual);
		Internals.Log.info(
			{logLevel: 'info', tag: 'clip-parity-ci'},
			'clip-parity compare:end',
			fixture.id,
			frame,
			performance.now() - stageStart,
			diff.mismatchedPixels,
		);
		if (diff.mismatchedPixels !== 0) {
			await Promise.all([
				savePixelEvidence(reference, `${fixture.id}-${frame}-native`),
				savePixelEvidence(actual, `${fixture.id}-${frame}-actual`),
				savePixelEvidence(diff.diff, `${fixture.id}-${frame}-diff`),
			]);
		}

		expect(diff.mismatchedPixels).toBe(0);
	});
}

// A fill-rule prefix must not be parsed as a coordinate pair.
test.each(['evenodd', 'nonzero'] as const)(
	'Should parse a polygon with the %s fill rule',
	(fillRule) => {
		expect(
			parseClipPath(
				`polygon(${fillRule}, 0% 0%, 100% 0%, 50% 100%)`,
				new DOMRect(10, 20, 200, 100),
			),
		).toEqual({
			type: 'polygon',
			fillRule,
			points: [
				{x: 10, y: 20},
				{x: 210, y: 20},
				{x: 110, y: 120},
			],
		});
	},
);

// Regression for remotion-dev/remotion#12928.
test('Should render polygon fill rules', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPolygonFillRules,
		frame: 0,
		inputProps: {},
		allowHtmlInCanvas: false,
	});
	const blob = await still.blob({format: 'png'});

	await testImage({blob, testId: clipPathPolygonFillRules.id});
});
