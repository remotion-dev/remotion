import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {threeDoverflow} from './fixtures/three-d-overflow';
import {testImage} from './utils';

test('Should render borders correctly with 3D transforms without overflow', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeDoverflow,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'three-d-overflow',
		allowedMismatchedPixelRatio: 0.02,
	});
});
