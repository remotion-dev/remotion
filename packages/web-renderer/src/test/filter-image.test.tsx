import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filterImage} from './fixtures/filter-image';
import {testImage} from './utils';

test('should render filter on image', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: filterImage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'filter-image'});
});
