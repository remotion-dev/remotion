import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgExternalFontReady,
	svgUnconditionalMediaFixture,
} from './fixtures/svg-external-font-selection';
import {captureNativeReference, compareNativePixels} from './native-reference';

const cases = ['', 'all', ' ALL ', ' \t ', '\u00a0', '\u00a0all\u00a0'].flatMap(
	(media) =>
		[false, true].flatMap((cssSource) =>
			[0, 1].map((frame) => ({media, cssSource, frame})),
		),
);
test.for(cases)(
	'preserves unconditional SVG media $media CSS=$cssSource frame=$frame',
	async ({media, cssSource, frame}, t) => {
		await svgExternalFontReady;
		const fixture = svgUnconditionalMediaFixture({
			media,
			cssSource,
			literal: false,
			literalFill: null,
		});
		const reference = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({
				composition: fixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const literalFixture = svgUnconditionalMediaFixture({
			media: null,
			cssSource,
			literal: true,
			literalFill: media.includes('\u00a0') ? 'black' : '#1373ab',
		});
		const literal = await (
			await renderStillOnWeb({
				composition: literalFixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const relative = await compareNativePixels(literal, actual);
		const native = await compareNativePixels(reference, actual);
		expect(relative.mismatchedPixels).toBe(0);
		// The private native cohort retains WebKit's known full-frame glyph differences.
		if (t.task.file.projectName === 'chromium')
			expect(native.mismatchedPixels).toBe(0);
	},
);
