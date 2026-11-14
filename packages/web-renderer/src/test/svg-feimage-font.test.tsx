import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgFeImageFont, svgFeImageFontModes} from './fixtures/svg-feimage-font';
import {captureNativeReference, countNativePixels} from './native-reference';

// Firefox paints the local feImage reference blank even in native screenshots.
test
	.skipIf(server.browser === 'firefox')
	.for(
		svgFeImageFontModes.flatMap((mode) =>
			[0, 1].map((frame) => ({mode, frame})),
		),
	)(
	'retains feImage use font inheritance for $mode at frame $frame',
	async ({mode, frame}) => {
		const composition = svgFeImageFont(mode, false, false);
		const literal = svgFeImageFont(mode, true, false);
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeLiteral = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
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
		const expected = await render(literal);
		const fallback = await render(svgFeImageFont(mode, true, true));
		for (const [name, blob] of [
			['native', native],
			['native-literal', nativeLiteral],
			['actual', actual],
			['expected', expected],
			['fallback', fallback],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/feimage-font/${server.browser}/${mode}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(
			(await countNativePixels(native, nativeLiteral)).mismatchedPixels,
		).toBe(0);
		expect(
			(await countNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		// WebKit retains a separate native-versus-SVG-image glyph rasterization gap.
		if (server.browser === 'chromium')
			expect((await countNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
	},
);
