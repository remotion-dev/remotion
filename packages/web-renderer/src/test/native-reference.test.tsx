import {expect, test} from 'vitest';
import {commands} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {nativeReferenceControl} from './fixtures/native-reference-control';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

// KINO-7762: snapshot tolerances must not be mistaken for browser pixel parity.
test.for([0, 1])(
	'matches native frame %i and detects one changed RGBA pixel',
	async (frame, t) => {
		if (t.task.file.projectName === 'firefox') {
			// Playwright Firefox cannot capture a transparent reference screenshot.
			t.skip();
			return;
		}

		const reference = await captureNativeReference(
			nativeReferenceControl,
			frame,
		);
		const output = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: nativeReferenceControl,
			frame,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
		const actual = await output.blob({format: 'png'});
		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
		const canvas = await output.canvas();
		const context = canvas.getContext('2d')!;
		const pixel = context.getImageData(4, 7, 1, 1);
		if (frame === 0) {
			pixel.data[0]++;
		} else {
			pixel.data[3] = 255;
		}

		context.putImageData(pixel, 4, 7);
		const changed = await canvas.convertToBlob({type: 'image/png'});
		const result = await compareNativePixels(reference, changed);
		expect(result.mismatchedPixels).toBe(1);
		expect(result.maxChannelDelta).toBe(frame === 0 ? 1 : 127);
		const saved = await savePixelEvidence(
			actual,
			`native-reference-control-${frame}-actual`,
		);
		const encoded = await commands.readFile(saved, 'base64');
		const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
		expect(
			(
				await compareNativePixels(
					new Blob([bytes], {type: 'image/png'}),
					actual,
				)
			).mismatchedPixels,
		).toBe(0);
		await savePixelEvidence(
			changed,
			`native-reference-control-${frame}-changed`,
		);
		await savePixelEvidence(
			result.diff,
			`native-reference-control-${frame}-diff`,
		);
	},
);

// KINO-7777: Firefox can capture authored opaque content without a transparent override.
test('captures opaque native RGBA and reads back opaque evidence in every engine', async () => {
	const reference = await captureNativeReference(nativeReferenceControl, 0, {
		omitBackground: false,
	});
	const actual = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: nativeReferenceControl,
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	expect((await compareNativePixels(reference, actual)).mismatchedPixels).toBe(
		0,
	);
	const saved = await savePixelEvidence(
		actual,
		'native-reference-control-opaque',
		{
			omitBackground: false,
		},
	);
	const encoded = await commands.readFile(saved, 'base64');
	const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
	expect(
		(await compareNativePixels(new Blob([bytes], {type: 'image/png'}), actual))
			.mismatchedPixels,
	).toBe(0);
});
