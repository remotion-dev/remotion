import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgCssImportFont} from './fixtures/svg-css-import-font';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for([0, 1])(
	'Imported CSS fonts match native frame %i (KINO-7769)',
	async (frame, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(svgCssImportFont, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: svgCssImportFont,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels !== 0) {
			await savePixelEvidence(reference, `css-import-font-${frame}-native`);
			await savePixelEvidence(actual, `css-import-font-${frame}-actual`);
			await savePixelEvidence(result.diff, `css-import-font-${frame}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
