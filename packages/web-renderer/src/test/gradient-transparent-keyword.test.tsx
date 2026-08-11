import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {gradientTransparentKeyword} from './fixtures/gradient-transparent-keyword';
import {testImage} from './utils';

test('should render gradient with transparent keyword correctly', async () => {
	await page.viewport(500, 250);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: gradientTransparentKeyword,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'gradient-transparent-keyword',
		threshold: 0.02,
	});
});
