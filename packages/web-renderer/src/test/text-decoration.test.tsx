import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {textDecoration} from './fixtures/text/text-decoration';
import {testImage} from './utils';

test('should render text-decoration', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textDecoration,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'text-decoration',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
