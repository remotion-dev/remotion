import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
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
		if (mode.startsWith('url-')) {
			const result = await compareNativePixels(native, actual);
			for (const [name, blob] of [
				['native', native],
				['literal', nativeLiteral],
				['actual', actual],
				['expected', expected],
				['diff', result.diff],
			] as const) {
				let binary = '';
				for (const byte of new Uint8Array(await blob.arrayBuffer()))
					binary += String.fromCharCode(byte);
				await server.commands.writeFile(
					`validation/svg-url-token/${server.browser}/${mode}-${positive}-${frame}-${name}.png`,
					btoa(binary),
					'base64',
				);
			}
		}

		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
