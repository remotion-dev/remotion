import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {scaledTranslatedSvg} from './fixtures/scaled-translated-svg';
import {testImage} from './utils';

test('scaled translated svg', async () => {
	await page.viewport(300, 300);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: scaledTranslatedSvg,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'scaled-translated-svg'});
});
