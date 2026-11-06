import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {boxShadow} from './fixtures/box-shadow';
import {
	boxShadowSpreadInset,
	boxShadowSpreadInsetAlpha,
} from './fixtures/box-shadow-spread-inset';
import {captureNativeReference, compareNativePixels} from './native-reference';
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
for (const fixture of [boxShadowSpreadInset, boxShadowSpreadInsetAlpha]) {
	for (const frame of [0, 1]) {
		test(`${fixture.id} matches native painting at frame ${frame}`, async (t) => {
			if (t.task.file.projectName === 'firefox') {
				// Firefox cannot capture this native element with transparent screenshot options.
				t.skip();
				return;
			}

			const reference = await captureNativeReference(fixture, frame);
			const actual = await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: fixture,
					frame,
					inputProps: {},
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const result = await compareNativePixels(reference, actual);
			expect(result.mismatchedPixels).toBe(0);
		});
	}
}
