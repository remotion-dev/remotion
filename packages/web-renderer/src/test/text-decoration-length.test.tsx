import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {textDecorationLengths} from './fixtures/text-decoration-length';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	textDecorationLengths.flatMap((entry) =>
		[0, 1].map((frame) => ({...entry, frame})),
	),
)(
	'resolves decoration thickness $id like its pixel declaration at frame $frame',
	async ({fixture, reference, frame}) => {
		const nativeRelative = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const nativeAbsolute = await captureNativeReference(reference, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(nativeRelative, nativeAbsolute))
				.mismatchedPixels,
		).toBe(0);
		const render = async (composition: typeof fixture) =>
			(
				await renderStillOnWeb({
					composition,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		// This checks declaration equivalence. Native text raster parity remains
		// separately tracked; the existing painter approximates line placement.
		const relative = await render(fixture);
		const absolute = await render(reference);
		expect(
			(await compareNativePixels(relative, absolute)).mismatchedPixels,
		).toBe(0);
	},
);
