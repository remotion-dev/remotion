import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {scaleFixture} from './fixtures/scale';
import {testImage} from './utils';

test('scale rendering behavior', async () => {
	// Render once for each scale value
	const {blob: blobDefault} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scaleFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

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

	// Visual regression tests
	await testImage({blob: blob1x, testId: 'scale-1x'});
	await testImage({blob: blob2x, testId: 'scale-2x'});

	// Scale should default to 1
	expect(blobDefault.size).toBe(blob1x.size);

	// scale=2 produces 4x pixels (2x width * 2x height)
	// PNG compression varies but 2x blob should be noticeably larger
	expect(blob2x.size).toBeGreaterThan(blob1x.size * 1.5);
});
