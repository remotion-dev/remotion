import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	textDecoration,
	textDecorationStyles,
	textDecorationWavy,
} from './fixtures/text/text-decoration';
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

test('should render text-decoration-styles', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textDecorationStyles,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'text-decoration-styles',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text-decoration-wavy', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textDecorationWavy,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'text-decoration-wavy',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
