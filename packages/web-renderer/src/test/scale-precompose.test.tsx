import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {scalePrecomposeFixture} from './fixtures/scale-precompose';
import {testImage} from './utils';

test('scale rendering with 3D transform precompose', async () => {
	// Render with large scale value
	const {blob: blob10x} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: scalePrecomposeFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 10,
	});

	// Visual regression test
	await testImage({blob: blob10x, testId: 'scale-precompose-10x'});

	// Verify the blob was created successfully
	expect(blob10x.size).toBeGreaterThan(0);
});
