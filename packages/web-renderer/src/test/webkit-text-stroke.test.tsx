import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {webkitTextStroke} from './fixtures/text/webkit-text-stroke';
import {testImage} from './utils';

test('should render -webkit-text-stroke', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: webkitTextStroke,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'webkit-text-stroke',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
