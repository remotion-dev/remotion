import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {deeplyNestedTransform} from './fixtures/deeply-nested-transform';
import {testImage} from './utils';

test('github unwrapped transform', async () => {
	page.viewport(400, 400);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: deeplyNestedTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'deeply-nested-transform'});
});
