import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {opaqueTargetText, opaqueTargetGroup} from './fixtures/opaque-target';
import {captureNativeReference, compareNativePixels} from './native-reference';

// KINO-7777: Linux LCD text differs when an opaque final target retains alpha.
test.for([0, 1])(
	'opaque final target matches native text at frame %i',
	async (frame, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(opaqueTargetText, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: opaqueTargetText,
				frame,
				licenseKey: 'free-license',
				inputProps: {},
				allowHtmlInCanvas: false,
				transparent: false,
			})
		).blob({format: 'png'});
		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
	},
);

test('still and batch targets preserve transparent defaults and translucent groups', async () => {
	for (const transparent of [undefined, true, false]) {
		const still = await renderStillOnWeb({
			composition: opaqueTargetGroup,
			frame: 0,
			licenseKey: 'free-license',
			inputProps: {},
			allowHtmlInCanvas: false,
			transparent,
		});
		const batch = await renderFramesOnWeb({
			composition: opaqueTargetGroup,
			frames: [0, 1],
			licenseKey: 'free-license',
			inputProps: {},
			allowHtmlInCanvas: false,
			transparent,
		});
		for (const result of [still, ...batch]) {
			const canvas = await result.canvas();
			const context = canvas.getContext('2d')!;
			expect([...context.getImageData(4, 4, 1, 1).data]).toEqual(
				transparent === false ? [0, 0, 128, 255] : [0, 0, 255, 128],
			);
			expect([...context.getImageData(12, 4, 1, 1).data]).toEqual(
				transparent === false ? [128, 0, 0, 255] : [255, 0, 0, 128],
			);
		}
	}
});

// The encoder alpha setting must not make internal group surfaces opaque.
test('media composites default and explicit opaque targets against black', async (t) => {
	if (t.task.file.projectName !== 'chromium') {
		t.skip();
		return;
	}

	for (const transparent of [undefined, false, true]) {
		let frames = 0;
		await renderMediaOnWeb({
			composition: opaqueTargetGroup,
			licenseKey: 'free-license',
			inputProps: {},
			allowHtmlInCanvas: false,
			transparent,
			container: 'webm',
			videoCodec: 'vp9',
			muted: true,
			onFrame: async (frame) => {
				const canvas = new OffscreenCanvas(16, 16);
				const context = canvas.getContext('2d')!;
				context.drawImage(frame, 0, 0);
				const bytes = new Uint8Array(frame.allocationSize({format: 'RGBA'}));
				await frame.copyTo(bytes, {format: 'RGBA'});
				expect(bytes[(4 * 16 + 4) * 4 + 3]).toBe(transparent ? 128 : 255);
				expect(context.getImageData(4, 4, 1, 1).data[3]).toBe(
					transparent ? 128 : 255,
				);
				if (!transparent) {
					expect([...context.getImageData(4, 4, 1, 1).data]).toEqual([
						0, 0, 128, 255,
					]);

					const offset = (4 * 16 + 4) * 4;
					expect([...bytes.slice(offset, offset + 4)]).toEqual([
						0, 0, 128, 255,
					]);
				}

				frames++;
				return frame;
			},
		});
		expect(frames).toBe(2);
	}
});
