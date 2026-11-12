import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgPercentDataFont,
	svgPercentDataFontEncodings,
} from './fixtures/svg-percent-data-font';
import {createFontFailureRecorder} from './font-failure-recorder';
import {
	captureNativeReference,
	compareNativePixels,
	countNativePixels,
} from './native-reference';

export const registerPercentDataFontPixelCases = (
	preferredTitle: 'A' | 'B',
	strictNative: boolean,
) => {
	const variants = svgPercentDataFontEncodings.map((encoding) => ({
		encoding,
		preferred: preferredTitle,
	}));
	test.for(
		variants.flatMap((variant) => [0, 1].map((frame) => ({...variant, frame}))),
	)(
		'preserves $encoding titled $preferred frame $frame',
		async ({encoding, preferred, frame}, context) => {
			const failure = createFontFailureRecorder(context);
			const composition = svgPercentDataFont(encoding, preferred, null, false);
			const literal = svgPercentDataFont(encoding, preferred, preferred, false);
			const fallback = svgPercentDataFont(encoding, preferred, preferred, true);
			const native = await captureNativeReference(composition, frame, {
				omitBackground: false,
			});
			const opposite = svgPercentDataFont(
				encoding,
				preferred,
				preferred === 'A' ? 'B' : 'A',
				false,
			);
			const oppositeNative = await captureNativeReference(opposite, frame, {
				omitBackground: false,
			});
			const nativeLiteral = await captureNativeReference(literal, frame, {
				omitBackground: false,
			});
			const repeat = await captureNativeReference(composition, frame, {
				omitBackground: false,
			});
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
			const actual = await render(composition);
			const literalActual = await render(literal);
			const fallbackActual = await render(fallback);
			const results = {
				nativeLiteral: await compareNativePixels(native, nativeLiteral),
				repeat: await compareNativePixels(native, repeat),
				nativeActual:
					strictNative || context.task.file.projectName === 'chromium'
						? await compareNativePixels(native, actual)
						: await countNativePixels(native, actual),
				literalActual: await compareNativePixels(literalActual, actual),
			};
			for (const [name, blob] of Object.entries({
				native,
				nativeLiteral,
				oppositeNative,
				repeat,
				actual,
				literalActual,
				fallbackActual,
			})) {
				await failure.png(
					`${encoding}-${preferred}-${frame}-${name}.png`,
					blob,
				);
			}

			failure.record(
				`${encoding}-${preferred}-${frame}-result.json`,
				JSON.stringify(
					Object.fromEntries(
						Object.entries(results).map(([key, value]) => [
							key,
							{pixels: value.mismatchedPixels, maxDelta: value.maxChannelDelta},
						]),
					),
				),
			);
			expect(
				(await countNativePixels(literalActual, fallbackActual))
					.mismatchedPixels,
			).toBeGreaterThan(0);
			expect(
				(await countNativePixels(native, oppositeNative)).mismatchedPixels,
			).toBeGreaterThan(0);
			for (const [comparison, result] of Object.entries(results)) {
				if (
					comparison === 'nativeActual' &&
					!strictNative &&
					context.task.file.projectName !== 'chromium'
				)
					continue;
				expect(result.mismatchedPixels).toBe(0);
				expect(result.maxChannelDelta).toBe(0);
			}
		},
	);
};
