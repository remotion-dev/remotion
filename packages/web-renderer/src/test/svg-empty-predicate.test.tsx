import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgEmptyPredicate,
	svgEmptyPredicates,
} from './fixtures/svg-empty-predicate';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgEmptyPredicates.flatMap((predicate, index) =>
		[0, 1].map((frame) => ({predicate, index, frame})),
	),
)(
	'preserves empty predicate $predicate at frame $frame',
	async ({index, frame}) => {
		const composition = svgEmptyPredicate({index, literal: false});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literal = await captureNativeReference(
			svgEmptyPredicate({index, literal: true}),
			frame,
			{omitBackground: false},
		);
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
		for (const [name, blob] of [
			['native', reference],
			['actual', actual],
			['diff', result.diff],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-empty-predicate/${server.browser}/${index}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(result.mismatchedPixels).toBe(0);
		expect(result.maxChannelDelta).toBe(0);
	},
);
