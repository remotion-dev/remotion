import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundClipText} from './fixtures/text/background-clip-text';
import {testImage} from './utils';

test('should render background-clip: text', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: backgroundClipText,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'background-clip-text',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
