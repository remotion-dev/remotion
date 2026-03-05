import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filter, filterSvgUrl} from './fixtures/filter';
import {testImage} from './utils';

test('should render filter', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: filter,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'filter'});
});

test('should render filter with SVG url', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: filterSvgUrl,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'filter-svg-url'});
});
