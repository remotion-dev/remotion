import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filterText} from './fixtures/text/filter-text';
import {testImage} from './utils';

test('should render filter on text', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: filterText,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'filter-text'});
});
