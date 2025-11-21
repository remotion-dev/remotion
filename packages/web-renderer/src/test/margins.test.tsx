import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {scaledTranslatedSvg} from './fixtures/scaled-translated-svg';
import {testImage} from './utils';

test('flex positioned scaled elements', async () => {
	await page.viewport(200, 200);
	const blob = await renderStillOnWeb({
		composition: flexPositionedScaled,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'flex-positioned-scaled'});
});

test('scaled translated svg', async () => {
	await page.viewport(300, 300);
	const blob = await renderStillOnWeb({
		composition: scaledTranslatedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'scaled-translated-svg'});
});
