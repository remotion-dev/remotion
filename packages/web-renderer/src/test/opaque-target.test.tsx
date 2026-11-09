import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {captureNativeReference, compareNativePixels} from './native-reference';

const OpaqueText = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg width={400} height={120}>
				<text
					x={12}
					y={48}
					style={{fontFamily: 'sans-serif', fontSize: 32 + frame * 2}}
				>
					Native opaque text
				</text>
			</svg>
		</AbsoluteFill>
	);
};

const opaqueText = {
	component: OpaqueText,
	id: 'opaque-target-text',
	width: 400,
	height: 120,
	fps: 30,
	durationInFrames: 2,
};

// KINO-7777: Linux LCD text differs when an opaque final target retains alpha.
test.for([0, 1])(
	'opaque final target matches native text at frame %i',
	async (frame, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(opaqueText, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: opaqueText,
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

const TransparentGroup = () => (
	<div style={{width: 16, height: 16, opacity: 0.5, mixBlendMode: 'screen'}}>
		<div style={{width: 16, height: 16, backgroundColor: 'red'}} />
		<div
			style={{
				position: 'absolute',
				top: 0,
				width: 8,
				height: 16,
				backgroundColor: 'blue',
			}}
		/>
	</div>
);
const transparentGroup = {
	component: TransparentGroup,
	id: 'opaque-target-group',
	width: 16,
	height: 16,
	fps: 30,
	durationInFrames: 2,
};

test('still and batch targets preserve transparent defaults and translucent groups', async () => {
	for (const transparent of [undefined, true, false]) {
		const still = await renderStillOnWeb({
			composition: transparentGroup,
			frame: 0,
			licenseKey: 'free-license',
			inputProps: {},
			allowHtmlInCanvas: false,
			transparent,
		});
		const batch = await renderFramesOnWeb({
			composition: transparentGroup,
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
test('media applies its transparent option to the final target', async (t) => {
	if (t.task.file.projectName !== 'chromium') {
		t.skip();
		return;
	}

	for (const transparent of [false, true]) {
		let frames = 0;
		await renderMediaOnWeb({
			composition: transparentGroup,
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
				if (!transparent)
					expect([...context.getImageData(4, 4, 1, 1).data]).toEqual([
						0, 0, 128, 255,
					]);
				frames++;
				return frame;
			},
		});
		expect(frames).toBe(2);
	}
});
