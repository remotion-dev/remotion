import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {whiteSpaceCollapsing} from './fixtures/whitespace-collapsing';
import {testImage} from './utils';

test('should render box-decoration-break', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: whiteSpaceCollapsing,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'box-decoration-break', threshold: 0.02});
});
