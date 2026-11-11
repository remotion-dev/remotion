import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgResourceCdataFont,
	svgResourceCdataModes,
} from './fixtures/svg-resource-cdata-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgResourceCdataModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)(
	'preserves SVG resource and CDATA font $mode frame $frame',
	async ({mode, frame}, t) => {
		const composition = svgResourceCdataFont(mode, false, false);
		const literal = svgResourceCdataFont(mode, true, false);
		const fallback = svgResourceCdataFont(mode, true, true);
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		for (const [name, blob] of [
			['source', reference],
			['literal', nativeControl],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-resource-cdata-font/${server.browser}/${mode}-${frame}-native-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(
			(await compareNativePixels(reference, nativeControl)).mismatchedPixels,
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
		const fallbackImage = await render(fallback);
		expect(
			(await compareNativePixels(expected, fallbackImage)).mismatchedPixels,
		).toBeGreaterThan(0);
		const actual = await render(composition);
		const result = await compareNativePixels(expected, actual);
		const nativeResult = await compareNativePixels(reference, actual);
		for (const [name, blob] of [
			['native', reference],
			['actual', actual],
			['control', expected],
			['control-diff', result.diff],
			['native-diff', nativeResult.diff],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-resource-cdata-font/${server.browser}/${mode}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			`validation/svg-resource-cdata-font/${server.browser}/${mode}-${frame}.json`,
			JSON.stringify(
				{
					controlMismatchedPixels: result.mismatchedPixels,
					nativeMismatchedPixels: nativeResult.mismatchedPixels,
					nativeMaxChannelDelta: nativeResult.maxChannelDelta,
				},
				null,
				2,
			),
		);
		expect(result.mismatchedPixels).toBe(0);
		expect(result.maxChannelDelta).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(nativeResult.mismatchedPixels).toBe(0);
	},
);
