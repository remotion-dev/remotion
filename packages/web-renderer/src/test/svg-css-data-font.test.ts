import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgCssDataFont,
	svgCssDataFontReady,
} from './fixtures/svg-css-data-font';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for([0, 1])(
	'CSS data font matches native frame %i (KINO-7769)',
	async (frame, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		await svgCssDataFontReady;
		const reference = await captureNativeReference(svgCssDataFont, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: svgCssDataFont,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		await savePixelEvidence(reference, `css-data-font-${frame}-native`);
		await savePixelEvidence(actual, `css-data-font-${frame}-actual`);
		await savePixelEvidence(result.diff, `css-data-font-${frame}-diff`);
		expect(result.mismatchedPixels).toBe(0);
	},
);
