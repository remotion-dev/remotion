import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {maskImageUrlSizing, rasterMask} from './fixtures/mask-image-url-sizing';
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

for (const {size, repeat, samples} of cases) {
	test(`preserves intrinsic sizing and alpha for ${size} / ${repeat}`, async () => {
		const Component = () => (
			<div
				style={{
					width: 100,
					height: 60,
					backgroundColor: 'red',
					maskImage: `url("${rasterMask}")`,
					maskSize: size,
					maskRepeat: repeat,
				}}
			/>
		);
		const blob = await (
			await renderStillOnWeb({
				composition: {
					component: Component,
					id: 'sized-mask',
					fps: 30,
					width: 100,
					height: 60,
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
			const context = new OffscreenCanvas(
				bitmap.width,
				bitmap.height,
			).getContext('2d')!;
			context.drawImage(bitmap, 0, 0);
			for (const [x, y, alpha] of samples) {
				expect(context.getImageData(x, y, 1, 1).data[3]).toBe(alpha);
			}
		} finally {
			bitmap.close();
		}
	});
}

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
	{maskPosition: '50% 50%'},
	{maskOrigin: 'content-box'},
	{maskClip: 'content-box'},
	{maskMode: 'luminance'},
	{maskSize: 'calc(50% + 10px) 20px'},
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
