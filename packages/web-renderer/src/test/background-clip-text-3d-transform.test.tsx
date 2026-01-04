import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundClipText3dTransform} from './fixtures/text/background-clip-text-3d-transform';
import {testImage} from './utils';

test('should render background-clip: text with 3D transforms', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: backgroundClipText3dTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'background-clip-text-3d-transform',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.03,
	});
});
