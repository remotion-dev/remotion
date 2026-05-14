import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {clipPathCircle} from './fixtures/clip-path-circle';
import {clipPathEllipse} from './fixtures/clip-path-ellipse';
import {clipPathInset} from './fixtures/clip-path-inset';
import {clipPathPath} from './fixtures/clip-path-path';
import {clipPathPolygon} from './fixtures/clip-path-polygon';
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
