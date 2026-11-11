import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgFontBeforeMutation,
	svgGroupedFontOrder,
	svgLocalFontGroups,
} from './fixtures/svg-font-order-mutation';
import {captureNativeReference, countNativePixels} from './native-reference';

const cropPaintMarker = async (blob: Blob) => {
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(120, 20);
	try {
		canvas.getContext('2d')!.drawImage(bitmap, 10, 65, 120, 20, 0, 0, 120, 20);
		return await canvas.convertToBlob({type: 'image/png'});
	} finally {
		bitmap.close();
		canvas.width = 0;
		canvas.height = 0;
	}
};

test.for([
	...svgLocalFontGroups.flatMap((group) =>
		[0, 1].map((frame) => ({kind: group, frame})),
	),
	...[0, 1].map((frame) => ({kind: 'root-selector' as const, frame})),
])(
	'preserves SVG font selection for $kind at frame $frame',
	async ({kind, frame}, t) => {
		const composition =
			kind === 'root-selector'
				? svgFontBeforeMutation({literal: false})
				: svgGroupedFontOrder({group: kind, literal: false});
		const control =
			kind === 'root-selector'
				? svgFontBeforeMutation({literal: true})
				: svgGroupedFontOrder({group: kind, literal: true});
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
		if (kind !== 'root-selector') {
			const [nativeMarker, actualMarker] = await Promise.all([
				cropPaintMarker(reference),
				cropPaintMarker(actual),
			]);
			expect(
				(await countNativePixels(nativeMarker, actualMarker)).mismatchedPixels,
			).toBe(0);
		}

		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		if (t.task.file.projectName === 'chromium')
			expect(
				(await countNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
	},
);
