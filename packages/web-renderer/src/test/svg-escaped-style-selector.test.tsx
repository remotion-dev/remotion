import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	escapedStyleSelectorModes,
	svgEscapedStyleSelector,
} from './fixtures/svg-escaped-style-selector';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for(
	escapedStyleSelectorModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)(
	'preserves escaped SVG selector $mode at frame $frame',
	async ({mode, frame}) => {
		const composition = svgEscapedStyleSelector({mode, literal: false});
		const control = svgEscapedStyleSelector({mode, literal: true});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literal = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(reference, literal)).mismatchedPixels,
		).toBe(0);
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (mode === 'wildcard') {
			for (const [name, blob] of [
				['native', reference],
				['actual', actual],
				['diff', result.diff],
			] as const) {
				let binary = '';
				for (const byte of new Uint8Array(await blob.arrayBuffer()))
					binary += String.fromCharCode(byte);
				await server.commands.writeFile(
					`validation/svg-wildcard-selector/${server.browser}/${frame}-${name}.png`,
					btoa(binary),
					'base64',
				);
			}
		}

		if (result.mismatchedPixels) {
			await savePixelEvidence(
				reference,
				`escaped-selector-${mode}-${frame}-native`,
				{omitBackground: false},
			);
			await savePixelEvidence(
				actual,
				`escaped-selector-${mode}-${frame}-actual`,
				{omitBackground: false},
			);
			await savePixelEvidence(
				result.diff,
				`escaped-selector-${mode}-${frame}-diff`,
				{omitBackground: false},
			);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
