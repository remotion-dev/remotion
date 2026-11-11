import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgPrecomposeFont,
	svgPrecomposeFontSources,
	svgPrecomposePaintKinds,
} from './fixtures/svg-precompose-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgPrecomposeFontSources.flatMap((source) =>
		svgPrecomposePaintKinds.flatMap((paint) =>
			[0, 1].map((frame) => ({source, paint, frame})),
		),
	),
)(
	'preserves SVG blended paint bounds $source $paint frame $frame',
	async ({source, paint, frame}, t) => {
		const composition = svgPrecomposeFont({
			source,
			effect: 'blend',
			literal: false,
			fontStep: null,
			paint,
		});
		const control = svgPrecomposeFont({
			source,
			effect: 'blend',
			literal: true,
			fontStep: null,
			paint,
		});
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literalNative = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(native, literalNative)).mismatchedPixels,
		).toBe(0);
		let noStroke: Blob | null = null;
		if (paint.startsWith('text-stroke')) {
			noStroke = await captureNativeReference(
				svgPrecomposeFont({
					source,
					effect: 'blend',
					literal: true,
					fontStep: null,
					paint: null,
				}),
				frame,
				{omitBackground: false},
			);
			expect(
				(await compareNativePixels(native, noStroke)).mismatchedPixels,
			).toBe(0);
		}

		const render = async (fixture: typeof composition) =>
			(
				await renderStillOnWeb({
					composition: fixture,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const actual = await render(composition);
		const expected = await render(control);
		const result = await compareNativePixels(actual, expected);
		const nativeResult = await compareNativePixels(native, actual);
		for (const [name, blob] of [
			['native', native],
			['actual', actual],
			['expected', expected],
			['diff', result.diff],
			['native-diff', nativeResult.diff],
			...(noStroke ? [['no-stroke-native', noStroke] as const] : []),
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-precompose-font-paint-bounds/${server.browser}/${source}-${paint}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(result.mismatchedPixels).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(nativeResult.mismatchedPixels).toBe(0);
	},
);
