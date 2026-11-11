import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgAtRuleText, svgAtRuleTextModes} from './fixtures/svg-at-rule-text';
import {captureNativeReference, compareNativePixels} from './native-reference';
test.for(
	svgAtRuleTextModes.flatMap((mode) =>
		[false, true].flatMap((positive) =>
			[0, 1].map((frame) => ({mode, positive, frame})),
		),
	),
)(
	'preserves style predicate with literal at-rule $mode positive=$positive frame=$frame',
	async ({mode, positive, frame}) => {
		const composition = svgAtRuleText({mode, positive, literal: false});
		const literal = svgAtRuleText({mode, positive, literal: true});
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeLiteral = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(native, nativeLiteral)).mismatchedPixels,
		).toBe(0);
		const options = {
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const actual = await (
			await renderStillOnWeb({...options, composition})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({...options, composition: literal})
		).blob({format: 'png'});
		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
