import {staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {createSvgDataMimeFixture} from './fixtures/svg-data-mime-case';
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
	(
		[
			{objectFit: 'fill', boxWidth: undefined, label: 'fill'},
			{objectFit: 'contain', boxWidth: undefined, label: 'contain'},
			{objectFit: 'contain', boxWidth: 64, label: 'contain64'},
			{objectFit: 'contain', boxWidth: 61, label: 'contain61'},
			{objectFit: 'contain', boxWidth: 31.359375, label: 'containFractional'},
		] as const
	).flatMap((configuration) =>
		[0, 1].map((frame) => ({...configuration, frame})),
	),
)(
	'preserves full-source SVG content through blob URLs ($label, frame:$frame)',
	async ({objectFit, boxWidth, label, frame}) => {
		const render = async (source: 'url' | 'blob') =>
			(
				await renderStillOnWeb({
					composition: createSvgFullSourceFixture(source, objectFit, boxWidth),
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
			const id = `svg-full-source-${label}-${frame}`;
			await savePixelEvidence(reference, `${id}-reference`);
			await savePixelEvidence(actual, `${id}-actual`);
			await savePixelEvidence(result.diff, `${id}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);

// KINO-7764: Equivalent SVG media-type spellings must not change identical vector content.
test.for(
	[
		{kind: 'uppercase', mediaType: 'IMAGE/SVG+XML;charset=utf-8'},
		{kind: 'whitespace', mediaType: 'image/svg+xml '},
	].flatMap(({kind, mediaType}) =>
		[false, true].flatMap((cover) =>
			[0, 1].map((frame) => ({kind, mediaType, cover, frame})),
		),
	),
)(
	'preserves SVG data MIME $kind (cover:$cover, frame:$frame)',
	async ({kind, mediaType, cover, frame}) => {
		const svg = await (await fetch(staticFile('nonzero-viewbox.svg'))).text();

		const render = async (type: string) =>
			(
				await renderStillOnWeb({
					composition: createSvgDataMimeFixture(svg, type, cover),
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const reference = await render('image/svg+xml;charset=utf-8');
		const actual = await render(mediaType);
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels > 0) {
			const id = `svg-mime-${kind}-${cover}-${frame}`;
			await savePixelEvidence(reference, `${id}-reference`);
			await savePixelEvidence(actual, `${id}-actual`);
			await savePixelEvidence(result.diff, `${id}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
