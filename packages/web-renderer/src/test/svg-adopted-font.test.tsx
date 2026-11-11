import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgAdoptedFont,
	svgAdoptedFontGroups,
} from './fixtures/svg-adopted-font';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgExternalCarrierModes,
	svgExternalEmptyCarrier,
} from './fixtures/svg-titled-font';
import {captureNativeReference, countNativePixels} from './native-reference';

test.for(
	svgAdoptedFontGroups.flatMap((group) =>
		[0, 1].map((frame) => ({group, frame})),
	),
)('retains adopted $group font at frame $frame', async ({group, frame}, t) => {
	const composition = svgAdoptedFont({group, literal: false});
	const control = svgAdoptedFont({group, literal: true});
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const nativeControl = await captureNativeReference(control, frame, {
		omitBackground: false,
	});
	expect(
		(await countNativePixels(reference, nativeControl)).mismatchedPixels,
	).toBe(0);
	const options = {
		frame,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	} as const;
	const actual = await (
		await renderStillOnWeb({...options, composition})
	).blob({format: 'png'});
	const expected = await (
		await renderStillOnWeb({...options, composition: control})
	).blob({format: 'png'});
	expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(0);
	if (t.task.file.projectName === 'chromium')
		expect((await countNativePixels(reference, actual)).mismatchedPixels).toBe(
			0,
		);
});

test.for(
	svgExternalCarrierModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)('retains registered carrier $mode frame $frame', async ({mode, frame}, t) => {
	await svgExternalFontReady;
	const composition = svgExternalEmptyCarrier({mode, literal: false});
	const control = svgExternalEmptyCarrier({mode, literal: true});
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const nativeControl = await captureNativeReference(control, frame, {
		omitBackground: false,
	});
	expect(
		(await countNativePixels(reference, nativeControl)).mismatchedPixels,
	).toBe(0);
	const options = {
		frame,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	} as const;
	const actual = await (
		await renderStillOnWeb({...options, composition})
	).blob({format: 'png'});
	const expected = await (
		await renderStillOnWeb({...options, composition: control})
	).blob({format: 'png'});
	expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(0);
	if (t.task.file.projectName === 'chromium')
		expect((await countNativePixels(reference, actual)).mismatchedPixels).toBe(
			0,
		);
});
