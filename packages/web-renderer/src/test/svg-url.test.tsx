import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	imgWithoutSource,
	svgUrlBlurredCover,
	svgUrlNonzeroViewbox,
} from './fixtures/svg-url-nonzero-viewbox';
import {testImage} from './utils';

test('should render an SVG loaded from a URL', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgUrlNonzeroViewbox,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-url-nonzero-viewbox'});
});

test('should not clip the blur of a cropped SVG loaded from a URL', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgUrlBlurredCover,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-url-blurred-cover'});
});

test('should render an image without a source', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: imgWithoutSource,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'img-without-source'});
});
