import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue9736BackgroundPosition} from './fixtures/issue-9736-background-position';
import {testImage} from './utils';

test('positions an oversized gradient clipped to text', async () => {
	await page.viewport(
		issue9736BackgroundPosition.width,
		issue9736BackgroundPosition.height,
	);
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: issue9736BackgroundPosition,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'issue-9736-background-position',
		threshold: 0.02,
		allowedMismatchedPixelRatio: 0.02,
	});
});
