import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {hardestCase} from './hardest-case';
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

test('hardest case', async () => {
	await page.viewport(300, 300);
	const blob = await renderStillOnWeb({
		composition: hardestCase,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'hardest-case'});
});
