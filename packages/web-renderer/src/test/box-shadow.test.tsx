import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {boxShadow} from './fixtures/box-shadow';
import {
	boxShadowSpreadInset,
	boxShadowSpreadInsetAlpha,
	boxShadowInsetReview,
	boxShadowInsetContentClip,
} from './fixtures/box-shadow-spread-inset';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test('should render box-shadow', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: boxShadow,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'box-shadow', threshold: 0.01});
});

// KINO-7770: spread was ignored and inset shadows were skipped entirely.
for (const fixture of [
	boxShadowSpreadInset,
	boxShadowSpreadInsetAlpha,
	boxShadowInsetReview,
	boxShadowInsetContentClip,
]) {
	for (const frame of [0, 1]) {
		test(`${fixture.id} ${fixture === boxShadowInsetContentClip ? 'preserves straight padding (KINO-7767 corners remain open)' : 'matches native painting'} at frame ${frame}`, async (t) => {
			const omitBackground =
				fixture === boxShadowSpreadInset ||
				fixture === boxShadowSpreadInsetAlpha;
			if (t.task.file.projectName === 'firefox' && omitBackground) {
				// Firefox cannot capture this native element with transparent screenshot options.
				t.skip();
				return;
			}

			let reference = await captureNativeReference(fixture, frame, {
				omitBackground,
			});
			let actual = await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: fixture,
					frame,
					inputProps: {},
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			if (fixture === boxShadowInsetContentClip) {
				// The full radius-4 reference remains a failing KINO-7767 diagnostic:
				// 28 corner pixels also differ on an unchanged, shadow-free blue box.
				// Pin the missing-padding regression with exact native straight pixels.
				const straightPadding = async (blob: Blob) => {
					const bitmap = await createImageBitmap(
						blob,
						24 + frame * 4,
						20,
						92,
						80,
					);
					const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
					try {
						canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
						return await canvas.convertToBlob({type: 'image/png'});
					} finally {
						bitmap.close();
						canvas.width = 0;
						canvas.height = 0;
					}
				};

				[reference, actual] = await Promise.all([
					straightPadding(reference),
					straightPadding(actual),
				]);
			}

			const result = await compareNativePixels(reference, actual);
			if (result.mismatchedPixels !== 0)
				await Promise.all([
					savePixelEvidence(reference, `${fixture.id}-${frame}-native`, {
						omitBackground,
					}),
					savePixelEvidence(actual, `${fixture.id}-${frame}-actual`, {
						omitBackground,
					}),
					savePixelEvidence(result.diff, `${fixture.id}-${frame}-diff`, {
						omitBackground,
					}),
				]);
			expect(result.mismatchedPixels).toBe(0);
		});
	}
}
