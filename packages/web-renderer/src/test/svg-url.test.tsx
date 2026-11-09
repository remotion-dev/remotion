import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {createSvgFullSourceFixture} from './fixtures/svg-full-source';
import {
	svgUrlBlurredCover,
	svgUrlNonzeroViewbox,
} from './fixtures/svg-url-nonzero-viewbox';
import '../symbol-dispose';
import {compareNativePixels, savePixelEvidence} from './native-reference';
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

// KINO-7764: source URL representation must not change an uncropped SVG.
test.for(
	(['fill', 'contain'] as const).flatMap((objectFit) =>
		[0, 1].map((frame) => ({objectFit, frame})),
	),
)(
	'preserves full-source SVG content through blob URLs ($objectFit, frame:$frame)',
	async ({objectFit, frame}) => {
		const render = async (source: 'url' | 'blob') =>
			(
				await renderStillOnWeb({
					composition: createSvgFullSourceFixture(source, objectFit),
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const reference = await render('url');
		const actual = await render('blob');
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels > 0) {
			const id = `svg-full-source-${objectFit}-${frame}`;
			await savePixelEvidence(reference, `${id}-reference`);
			await savePixelEvidence(actual, `${id}-actual`);
			await savePixelEvidence(result.diff, `${id}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
