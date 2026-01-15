import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {whiteSpaceCollapsing} from './fixtures/whitespace-collapsing';
import {whiteSpaceCollapsing2} from './fixtures/whitespace-collapsing-2';
import {testImage} from './utils';

test('should render box-decoration-break', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: whiteSpaceCollapsing,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'whitespace-collapsing', threshold: 0.02});
});

test('should render box-decoration-break', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: whiteSpaceCollapsing2,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'whitespace-collapsing-2', threshold: 0.02});
});
