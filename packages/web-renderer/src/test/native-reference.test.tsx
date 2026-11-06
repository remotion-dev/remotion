import {expect, test} from 'vitest';
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
		await savePixelEvidence(actual, 'native-reference-control-actual');
		await savePixelEvidence(changed, 'native-reference-control-changed');
		await savePixelEvidence(result.diff, 'native-reference-control-diff');
	},
);
