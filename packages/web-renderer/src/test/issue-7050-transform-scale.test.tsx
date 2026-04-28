import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7050TransformScale} from './fixtures/issue-7050-transform-scale';
import {testImage} from './utils';

test('should render issue-7050-transform-scale', async () => {
	await page.viewport(1600, 800);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7050TransformScale,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7050-transform-scale'});
});
