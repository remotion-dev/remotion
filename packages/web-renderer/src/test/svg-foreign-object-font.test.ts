import {NoReactInternals} from 'remotion/no-react';
import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgForeignObjectFont,
	svgForeignObjectFontReady,
} from './fixtures/svg-foreign-object-font';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for([0, 1])(
	'SVG foreignObject registered fonts match native frame %i (KINO-7769)',
	async (frame, t) => {
		// WebKit exports but still has 59/46 native text channel differences.
		// Firefox's native screenshot reference does not preserve transparency.
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		await svgForeignObjectFontReady;
		expect(
			NoReactInternals.getRegisteredFontFaces().some(
				(font) => font.fontFamily === 'Foreign object registered font',
			),
		).toBe(true);
		const reference = await captureNativeReference(svgForeignObjectFont, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: svgForeignObjectFont,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels !== 0) {
			await savePixelEvidence(reference, `foreign-object-font-${frame}-native`);
			await savePixelEvidence(actual, `foreign-object-font-${frame}-actual`);
			await savePixelEvidence(result.diff, `foreign-object-font-${frame}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
