import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgCssDataCarrierModes,
	svgCssDataEmptyCarrier,
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
		if (result.mismatchedPixels !== 0) {
			await savePixelEvidence(reference, `css-data-font-${frame}-native`);
			await savePixelEvidence(actual, `css-data-font-${frame}-actual`);
			await savePixelEvidence(result.diff, `css-data-font-${frame}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);

const carrierOptions = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;

test.for(
	svgCssDataCarrierModes
		.filter((mode) => mode !== 'cache')
		.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'preserves CSS data font selection with an empty $mode carrier at frame $frame',
	async ({mode, frame}, t) => {
		await svgCssDataFontReady;
		const fixture = svgCssDataEmptyCarrier({mode, literal: false});
		const literal = svgCssDataEmptyCarrier({mode, literal: true});
		const native = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const nativeLiteral = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({...carrierOptions, composition: fixture, frame})
		).blob({format: 'png'});
		const exportedLiteral = await (
			await renderStillOnWeb({...carrierOptions, composition: literal, frame})
		).blob({format: 'png'});
		const nativeControl = await compareNativePixels(native, nativeLiteral);
		const exportControl = await compareNativePixels(actual, exportedLiteral);
		const nativeComparison =
			t.task.file.projectName === 'chromium'
				? await compareNativePixels(native, actual)
				: null;
		expect(nativeControl.mismatchedPixels).toBe(0);
		expect(exportControl.mismatchedPixels).toBe(0);
		if (nativeComparison) expect(nativeComparison.mismatchedPixels).toBe(0);
	},
);

test('keeps CSS data carrier batch and fresh frames consistent for CSSOM-only changes', async () => {
	await svgCssDataFontReady;
	const fixture = svgCssDataEmptyCarrier({mode: 'cache', literal: false});
	const frames = await renderFramesOnWeb({
		...carrierOptions,
		composition: fixture,
		frames: [0, 1, 2],
	});
	const differences = [];
	for (let frame = 0; frame < 3; frame++) {
		const batch = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({...carrierOptions, composition: fixture, frame})
		).blob({format: 'png'});
		differences.push(
			(await compareNativePixels(batch, fresh)).mismatchedPixels,
		);
	}

	// An inactive CSSOM boundary can conservatively prevent retargeting.
	// Consistency does not establish native parity for that fallback.
	expect(differences).toEqual([0, 0, 0]);
});
