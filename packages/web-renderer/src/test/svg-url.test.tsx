import {staticFile} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {createSvgDataMimeFixture} from './fixtures/svg-data-mime-case';
import {createSvgFullSourceFixture} from './fixtures/svg-full-source';
import {
	svgUrlBlurredCover,
	svgUrlNonzeroViewbox,
} from './fixtures/svg-url-nonzero-viewbox';
import '../symbol-dispose';
import {testCompositions, testImage} from './utils';

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

test('renders blob sources and SVG data MIME spellings', async () => {
	const svg = await (await fetch(staticFile('nonzero-viewbox.svg'))).text();
	await testCompositions({
		scale: null,
		cases: [
			createSvgFullSourceFixture('blob', 'fill'),
			createSvgFullSourceFixture('blob', 'contain'),
			createSvgFullSourceFixture('blob', 'contain', 31.359375),
			createSvgDataMimeFixture(svg, 'IMAGE/SVG+XML;charset=utf-8', false),
			createSvgDataMimeFixture(svg, 'image/svg+xml ', true),
		].map((composition) => ({composition, frame: 1})),
		columns: 3,
		testId: 'svg-source-types',
	});
});
