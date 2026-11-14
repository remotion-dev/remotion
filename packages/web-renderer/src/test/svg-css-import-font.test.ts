import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgCssImportFont} from './fixtures/svg-css-import-font';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for([
	{frame: 0, legacy: false},
	{frame: 1, legacy: false},
	{frame: 0, legacy: true},
	{frame: 1, legacy: true},
])(
	'Imported CSS fonts match native $frame, legacy API $legacy (KINO-7769)',
	async ({frame, legacy}, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(svgCssImportFont, frame);
		const layerName = legacy
			? vi
					.spyOn(CSSImportRule.prototype, 'layerName', 'get')
					.mockReturnValue(undefined as unknown as string)
			: null;
		let actual: Blob;
		try {
			actual = await (
				await renderStillOnWeb({
					composition: svgCssImportFont,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		} finally {
			layerName?.mockRestore();
		}

		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels !== 0) {
			await savePixelEvidence(reference, `css-import-font-${frame}-native`);
			await savePixelEvidence(actual, `css-import-font-${frame}-actual`);
			await savePixelEvidence(result.diff, `css-import-font-${frame}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
