import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {marginsTest} from './margins';
import {testImage} from './utils';

test('even harder case', async () => {
	await page.viewport(200, 200);
	const blob = await renderStillOnWeb({
		composition: marginsTest,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'margins-test'});
});
