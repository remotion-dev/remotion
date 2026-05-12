import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7050Repro} from './fixtures/issue-7050-repro';
import {testImage} from './utils';

test('should render issue-7050-repro', async () => {
	await page.viewport(1600, 800);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7050Repro,
			frame: 0,
			inputProps: {},
			scale: 2,
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7050-repro'});
});
