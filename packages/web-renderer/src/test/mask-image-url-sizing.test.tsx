import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	createMaskImageLayersGridFixture,
	maskImageLayerSources,
} from './fixtures/mask-image-layers';
import '../symbol-dispose';
import {maskImageUrlCalcPosition} from './fixtures/mask-image-url-calc-position';
import {
	maskImageUrlMathSize,
	maskImageUrlMathSizeLiteral,
	maskMathExtendedOpaque,
	maskMathExtendedLiteralOpaque,
	maskMathExtendedTransparent,
	maskMathExtendedLiteralTransparent,
	maskMathExtendedMultipleOpaque,
	maskMathExtendedLiteralMultipleOpaque,
	maskMathExtendedMultipleTransparent,
	maskMathExtendedLiteralMultipleTransparent,
} from './fixtures/mask-image-url-math-size';
import {maskImageUrlPosition} from './fixtures/mask-image-url-position';
import {maskImageUrlSizing, rasterMask} from './fixtures/mask-image-url-sizing';
import {
	captureNativeReference,
	compareNativePixels,
	countNativePixels,
} from './native-reference';
import {testImage} from './utils';

for (const scale of [1, 2]) {
	test(`renders raster mask sizing and repeat at scale ${scale}`, async () => {
		await page.viewport(500 * scale, 180 * scale);
		const blob = await (
			await renderStillOnWeb({
				composition: maskImageUrlSizing,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				scale,
			})
		).blob({format: 'png'});
		await testImage({
			blob,
			testId: `mask-image-url-sizing-${scale}`,
			threshold: 0.02,
		});
	});
}

for (const scale of [0.5, 1, 2]) {
	test(`tiles a 520px mask instead of stretching it at scale ${scale}`, async () => {
		const Component = () => (
			<div
				style={{
					width: 1040,
					height: 520,
					backgroundColor: 'red',
					maskImage: `url("${rasterMask}")`,
					maskSize: '520px 520px',
					maskRepeat: 'repeat',
				}}
			/>
		);
		const blob = await (
			await renderStillOnWeb({
				composition: {
					component: Component,
					id: 'repeating-mask',
					fps: 30,
					width: 1040,
					height: 520,
					durationInFrames: 1,
				},
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				scale,
			})
		).blob({format: 'png'});
		const bitmap = await createImageBitmap(blob);
		try {
			const context = new OffscreenCanvas(
				bitmap.width,
				bitmap.height,
			).getContext('2d')!;
			context.drawImage(bitmap, 0, 0);
			for (const [x, alpha] of [
				[130, 255],
				[390, 0],
				[650, 255],
				[910, 0],
			]) {
				expect(context.getImageData(x * scale, 260 * scale, 1, 1).data[3]).toBe(
					alpha,
				);
			}
		} finally {
			bitmap.close();
		}
	});
}

const cases: {
	size: string;
	repeat: string;
	samples: [number, number, number][];
}[] = [
	{
		size: 'contain',
		repeat: 'no-repeat',
		samples: [
			[25, 25, 255],
			[75, 25, 0],
			[25, 55, 0],
		],
	},
	{
		size: 'cover',
		repeat: 'no-repeat',
		samples: [
			[20, 20, 255],
			[90, 20, 0],
		],
	},
	{
		size: 'auto',
		repeat: 'no-repeat',
		samples: [
			[0, 0, 255],
			[9, 0, 0],
			[0, 8, 0],
		],
	},
	{
		size: '50% auto',
		repeat: 'no-repeat',
		samples: [
			[10, 10, 255],
			[40, 10, 0],
			[10, 40, 0],
		],
	},
	{
		size: 'auto 20px',
		repeat: 'no-repeat',
		samples: [
			[10, 10, 255],
			[30, 10, 0],
			[10, 30, 0],
		],
	},
	{
		size: '0px 0px',
		repeat: 'repeat',
		samples: [
			[0, 0, 0],
			[50, 30, 0],
		],
	},
	{
		size: '40px 20px',
		repeat: 'repeat no-repeat',
		samples: [
			[10, 10, 255],
			[30, 10, 0],
			[50, 10, 255],
			[10, 30, 0],
		],
	},
	{
		size: '40px 20px',
		repeat: 'no-repeat repeat',
		samples: [
			[10, 10, 255],
			[30, 10, 0],
			[10, 30, 255],
			[50, 30, 0],
		],
	},
];

// All cases share one render: each case gets its own 100x60 cell with a 10px gap.
test('preserves intrinsic sizing and alpha for every size / repeat case', async () => {
	const Component = () => (
		<>
			{cases.map(({size, repeat}, index) => (
				<div
					key={`${size} / ${repeat}`}
					style={{
						position: 'absolute',
						left: (index % 4) * 110,
						top: Math.floor(index / 4) * 70,
						width: 100,
						height: 60,
						backgroundColor: 'red',
						maskImage: `url("${rasterMask}")`,
						maskSize: size,
						maskRepeat: repeat,
					}}
				/>
			))}
		</>
	);
	const blob = await (
		await renderStillOnWeb({
			composition: {
				component: Component,
				id: 'sized-mask',
				fps: 30,
				width: 430,
				height: 130,
				durationInFrames: 1,
			},
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const bitmap = await createImageBitmap(blob);
	try {
		const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext(
			'2d',
		)!;
		context.drawImage(bitmap, 0, 0);
		const expected: string[] = [];
		const actual: string[] = [];
		cases.forEach(({size, repeat, samples}, index) => {
			for (const [x, y, alpha] of samples) {
				const label = `${size} / ${repeat} at ${x},${y}: alpha`;
				expected.push(`${label} ${alpha}`);
				actual.push(
					`${label} ${
						context.getImageData(
							(index % 4) * 110 + x,
							Math.floor(index / 4) * 70 + y,
							1,
							1,
						).data[3]
					}`,
				);
			}
		});
		expect(actual).toEqual(expected);
	} finally {
		bitmap.close();
	}
});

test('clips a repeating mask to its border box when children overflow', async () => {
	const Component = () => (
		<div
			style={{
				position: 'absolute',
				left: 10,
				top: 10,
				width: 40,
				height: 40,
				maskImage: `url("${rasterMask}")`,
				maskSize: '20px 20px',
				maskRepeat: 'repeat',
			}}
		>
			<div style={{width: 100, height: 100, backgroundColor: 'red'}} />
		</div>
	);
	const blob = await (
		await renderStillOnWeb({
			composition: {
				component: Component,
				id: 'clipped-mask',
				fps: 30,
				width: 120,
				height: 120,
				durationInFrames: 1,
			},
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const bitmap = await createImageBitmap(blob);
	try {
		const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext(
			'2d',
		)!;
		context.drawImage(bitmap, 0, 0);
		for (const [x, y, alpha] of [
			[15, 15, 255],
			[35, 35, 255],
			[55, 15, 0],
			[15, 55, 0],
			[95, 95, 0],
		]) {
			expect(context.getImageData(x, y, 1, 1).data[3]).toBe(alpha);
		}
	} finally {
		bitmap.close();
	}
});

for (const unsupported of [
	{maskRepeat: 'space'},
	{maskRepeat: 'round'},
	{maskOrigin: 'content-box'},
	{maskClip: 'content-box'},
	{maskMode: 'luminance'},
]) {
	test(`rejects unsupported raster mask styles: ${JSON.stringify(unsupported)}`, async () => {
		const Component = () => (
			<div
				style={{
					width: 100,
					height: 60,
					backgroundColor: 'red',
					maskImage: `url("${rasterMask}")`,
					maskSize: '20px 20px',
					maskRepeat: 'repeat',
					...unsupported,
				}}
			/>
		);
		await expect(
			renderStillOnWeb({
				composition: {
					component: Component,
					id: 'unsupported-mask',
					fps: 30,
					width: 100,
					height: 60,
					durationInFrames: 1,
				},
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			}),
		).rejects.toThrow('Unsupported value');
	});
}

// KINO-7771: nonzero mask positions used to be rejected before painting.
for (const composition of [maskImageUrlPosition, maskImageUrlCalcPosition]) {
	for (const frame of [0, 1]) {
		test(`${composition.id} matches native frame ${frame}`, async (t) => {
			if (t.task.file.projectName === 'firefox') {
				t.skip();
				return;
			}

			const startedAt = performance.now();
			let phase = 'native browser capture';
			t.onTestFailed(() => {
				Internals.Log.error(
					{logLevel: 'error', tag: '@remotion/web-renderer'},
					`${composition.id} frame ${frame}: ${phase}, ${Math.round(performance.now() - startedAt)}ms elapsed`,
				);
			});
			const reference = await captureNativeReference(composition, frame);
			phase = 'rendering output';
			const still = await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			});
			phase = 'PNG encoding';
			const actual = await still.blob({format: 'png'});
			phase = 'decoding and comparing RGBA';
			const result = await compareNativePixels(reference, actual);
			expect(result.mismatchedPixels).toBe(0);
		});
	}
}

// KINO-7771: authored mask layers must be composed before masking the content.
// All four mask sources share one 2x2 grid composition per background.
for (const transparent of [false, true]) {
	const composition = createMaskImageLayersGridFixture(!transparent);
	for (const frame of [0, 1]) {
		test(`composes multiple alpha mask layers ${composition.id} frame ${frame}`, async (t) => {
			if (transparent && t.task.file.projectName === 'firefox') {
				t.skip();
				return;
			}

			const reference = await captureNativeReference(composition, frame, {
				omitBackground: transparent,
			});
			const actual = await (
				await renderStillOnWeb({
					composition,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const result = await compareNativePixels(reference, actual);
			const cellMismatches: Record<string, number> = {};
			if (result.mismatchedPixels > 0) {
				const [expectedPixels, actualPixels] = await Promise.all(
					[reference, actual].map(async (blob) => {
						const bitmap = await createImageBitmap(blob);
						try {
							const context = new OffscreenCanvas(
								bitmap.width,
								bitmap.height,
							).getContext('2d')!;
							context.drawImage(bitmap, 0, 0);
							return context.getImageData(0, 0, bitmap.width, bitmap.height)
								.data;
						} finally {
							bitmap.close();
						}
					}),
				);
				for (let y = 0; y < composition.height; y++) {
					for (let x = 0; x < composition.width; x++) {
						const offset = (y * composition.width + x) * 4;
						const source =
							maskImageLayerSources[
								(y >= composition.height / 2 ? 2 : 0) +
									(x >= composition.width / 2 ? 1 : 0)
							];
						for (let channel = 0; channel < 4; channel++) {
							if (
								expectedPixels[offset + channel] !==
								actualPixels[offset + channel]
							) {
								cellMismatches[source] = (cellMismatches[source] ?? 0) + 1;
								break;
							}
						}
					}
				}
			}

			expect({
				mismatchedPixels: result.mismatchedPixels,
				cellMismatches,
			}).toEqual({mismatchedPixels: 0, cellMismatches: {}});
		});
	}
}

// KINO-7771: Math sizes must resolve like independently authored literal sizes.
// These comparisons isolate sizing from existing native raster-mask paint gaps.
for (const {math, literal, transparent} of [
	{
		math: maskImageUrlMathSize,
		literal: maskImageUrlMathSizeLiteral,
		transparent: true,
	},
	{
		math: maskMathExtendedOpaque,
		literal: maskMathExtendedLiteralOpaque,
		transparent: false,
	},
	{
		math: maskMathExtendedTransparent,
		literal: maskMathExtendedLiteralTransparent,
		transparent: true,
	},
	{
		math: maskMathExtendedMultipleOpaque,
		literal: maskMathExtendedLiteralMultipleOpaque,
		transparent: false,
	},
	{
		math: maskMathExtendedMultipleTransparent,
		literal: maskMathExtendedLiteralMultipleTransparent,
		transparent: true,
	},
]) {
	for (const frame of [0, 1]) {
		// Each check gets its own test so the per-test timeout covers one native
		// capture pair or one render pair instead of all of them serially.
		test(`resolves CSS math mask sizes ${math.id} frame ${frame} natively`, async (t) => {
			if (transparent && t.task.file.projectName === 'firefox') {
				t.skip();
				return;
			}

			await page.viewport(1280, 720);
			const reference = await captureNativeReference(math, frame, {
				omitBackground: transparent,
			});
			const literalReference = await captureNativeReference(literal, frame, {
				omitBackground: transparent,
			});
			expect(
				(await countNativePixels(reference, literalReference)).mismatchedPixels,
			).toBe(0);
		});

		for (const scale of [1, 2]) {
			test(`resolves CSS math mask sizes ${math.id} frame ${frame} at scale ${scale}`, async () => {
				await page.viewport(1280, 720);
				// Render calls already queue internally. Let the first PNG encode
				// overlap the second render instead of serializing both operations.
				const rendered = await Promise.all(
					[math, literal].map(async (composition) => {
						const result = await renderStillOnWeb({
							composition,
							frame,
							scale,
							inputProps: {},
							licenseKey: 'free-license',
							allowHtmlInCanvas: false,
						});
						const canvas = await result.canvas();
						try {
							return await result.blob({format: 'png'});
						} finally {
							canvas.width = 0;
							canvas.height = 0;
						}
					}),
				);

				expect(
					(await countNativePixels(rendered[0], rendered[1])).mismatchedPixels,
				).toBe(0);
			});
		}
	}
}
