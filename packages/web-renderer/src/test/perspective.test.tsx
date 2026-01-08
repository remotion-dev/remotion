import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {perspectiveVariants} from './fixtures/perspective';
import {testImage} from './utils';

test('should render different perspective values', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: perspectiveVariants,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'perspective-variants'});
});
