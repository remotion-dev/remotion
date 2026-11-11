import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgDefinitionModes,
	svgDefinitionFont,
	svgDefinitionFontUrl,
	svgWildcardStyleModes,
	svgWildcardStyle,
} from './fixtures/svg-font-definition-review';
import {captureNativeReference, countNativePixels} from './native-reference';

test.for(
	svgWildcardStyleModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)('preserves wildcard style $mode frame $frame', async ({mode, frame}) => {
	const composition = svgWildcardStyle({mode, literal: false});
	const control = svgWildcardStyle({mode, literal: true});
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const nativeControl = await captureNativeReference(control, frame, {
		omitBackground: false,
	});
	expect(
		(await countNativePixels(reference, nativeControl)).mismatchedPixels,
	).toBe(0);
	const actual = await (
		await renderStillOnWeb({
			composition,
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	expect((await countNativePixels(reference, actual)).mismatchedPixels).toBe(0);
});

test.for(
	svgDefinitionModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'fetches only instantiated definition $mode frame $frame',
	async ({mode, frame}, t) => {
		const data = await (await fetch(svgDefinitionFontUrl)).arrayBuffer();
		const dataUrl = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(new Blob([data], {type: 'font/woff2'}));
		});
		const composition = svgDefinitionFont({
			mode,
			fontUrl: svgDefinitionFontUrl,
		});
		const control = svgDefinitionFont({mode, fontUrl: dataUrl});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await countNativePixels(reference, nativeControl)).mismatchedPixels,
		).toBe(0);
		const used =
			mode === 'direct' ||
			mode === 'use-target' ||
			mode === 'nested' ||
			mode === 'symbol' ||
			mode === 'hidden-defs' ||
			mode === 'hidden-source-group';
		const fetchFont = vi.spyOn(NoReactInternals, 'fetchFontData');
		if (used) fetchFont.mockResolvedValue(data);
		else
			fetchFont.mockRejectedValue(
				new Error('Unused definition font must not be requested'),
			);
		try {
			const options = {
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			} as const;
			const actual = await (
				await renderStillOnWeb({...options, composition})
			).blob({format: 'png'});
			expect(fetchFont).toHaveBeenCalledTimes(used ? 1 : 0);
			const expected = await (
				await renderStillOnWeb({...options, composition: control})
			).blob({format: 'png'});
			expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
				0,
			);
			if (!used || t.task.file.projectName === 'chromium')
				expect(
					(await countNativePixels(reference, actual)).mismatchedPixels,
				).toBe(0);
		} finally {
			fetchFont.mockRestore();
		}
	},
);
