import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {objectFit} from './fixtures/object-fit';
import {objectPosition} from './fixtures/object-position';
import {testImage} from './utils';

test('should render object-fit values correctly', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: objectFit,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'object-fit'});
});

// KINO-7764: non-centered positioning must survive source cropping.
test('should render object-position values correctly', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: objectPosition,
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	await testImage({
		blob,
		testId: 'object-position',
		threshold: 0,
		allowedMismatchedPixelRatio: 0,
	});
});
