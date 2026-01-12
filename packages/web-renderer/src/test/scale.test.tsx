import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {scaleFixture} from './fixtures/scale';
import {testImage} from './utils';

test('scale=1 should render at original dimensions', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 1,
	});

	await testImage({blob, testId: 'scale-1x'});
});

test('scale=2 should render at 2x dimensions', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 2,
	});

	await testImage({blob, testId: 'scale-2x'});
});

test('scale should increase output blob size', async () => {
	const {blob: blob1x} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 1,
	});

	const {blob: blob2x} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 2,
	});

	// scale=2 produces 4x pixels (2x width * 2x height)
	// PNG compression varies but 2x blob should be noticeably larger
	expect(blob2x.size).toBeGreaterThan(blob1x.size * 1.5);
});

test('scale should default to 1 when not specified', async () => {
	const {blob: blobDefault} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	const {blob: blobExplicit} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 1,
	});

	// Should produce same size when scale defaults to 1
	expect(blobDefault.size).toBe(blobExplicit.size);
});
