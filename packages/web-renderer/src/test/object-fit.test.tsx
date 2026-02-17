import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {objectFit} from './fixtures/object-fit';
import {testImage} from './utils';

test('should render object-fit values correctly', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: objectFit,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'object-fit'});
});
