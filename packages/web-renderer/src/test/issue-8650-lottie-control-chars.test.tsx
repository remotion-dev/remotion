import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue8650LottieControlChars} from './fixtures/issue-8650-lottie-control-chars';
import {testImage} from './utils';

test('issue #8650: SVG with U+0003 control chars in aria-label must rasterize without error', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue8650LottieControlChars,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-8650-lottie-control-chars'});
});
