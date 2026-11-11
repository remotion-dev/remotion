import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgTitledFontCarrier,
	svgTitledFontModes,
	svgTitledFontSources,
} from './fixtures/svg-titled-font-carrier';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgTitledFontModes.flatMap((mode) =>
		svgTitledFontSources.flatMap((source) =>
			[0, 1].map((frame) => ({mode, source, frame})),
		),
	),
)(
	'preserves titled stylesheet font $mode $source frame $frame',
	async ({mode, source, frame}) => {
		const composition = svgTitledFontCarrier(mode, source, false, false);
		const literal = svgTitledFontCarrier(mode, source, true, false);
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literalReference = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(reference, literalReference)).mismatchedPixels,
		).toBe(0);
		const render = async (target: typeof composition) =>
			(
				await renderStillOnWeb({
					composition: target,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const expected = await render(literal);
		const fallback = await render(
			svgTitledFontCarrier(mode, source, true, true),
		);
		expect(
			(await compareNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const actual = await render(composition);
		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
