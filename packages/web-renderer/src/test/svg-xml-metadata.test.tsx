import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgXmlMetadataModes, svgXmlMetadata} from './fixtures/svg-xml-metadata';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for(
	svgXmlMetadataModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)('renders XML SVG metadata $mode at frame $frame', async ({mode, frame}) => {
	const composition = svgXmlMetadata({mode, literal: false});
	const control = svgXmlMetadata({mode, literal: true});
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const literal = await captureNativeReference(control, frame, {
		omitBackground: false,
	});
	expect((await compareNativePixels(reference, literal)).mismatchedPixels).toBe(
		0,
	);
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
	if (result.mismatchedPixels) {
		await savePixelEvidence(reference, `xml-metadata-${mode}-${frame}-native`, {
			omitBackground: false,
		});
		await savePixelEvidence(actual, `xml-metadata-${mode}-${frame}-actual`, {
			omitBackground: false,
		});
		await savePixelEvidence(result.diff, `xml-metadata-${mode}-${frame}-diff`, {
			omitBackground: false,
		});
	}

	expect(result.mismatchedPixels).toBe(0);
});
