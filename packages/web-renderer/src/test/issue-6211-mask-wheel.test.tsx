import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue6211MaskWheel} from './fixtures/issue-6211-mask-wheel';
import {testImage} from './utils';

test('should render issue 6211 mask wheel', async () => {
	await page.viewport(issue6211MaskWheel.width, issue6211MaskWheel.height);

	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: issue6211MaskWheel,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'issue-6211-mask-wheel',
		allowedMismatchedPixelRatio: 0.015,
	});
});
