import {VideoSample} from 'mediabunny';
import {expect, test} from 'vitest';
import {rotateFrame} from '../video-extraction/rotate-frame';

type Rgb = readonly [number, number, number];

const RED: Rgb = [255, 0, 0];
const GREEN: Rgb = [0, 255, 0];
const BLUE: Rgb = [0, 0, 255];
const WHITE: Rgb = [255, 255, 255];

// 2x2 frame: red | green
//            blue | white
const makeFrame = () =>
	new VideoFrame(
		new Uint8Array([...RED, 255, ...GREEN, 255, ...BLUE, 255, ...WHITE, 255]),
		{format: 'RGBA', codedWidth: 2, codedHeight: 2, timestamp: 0},
	);

const readPixels = (
	source: CanvasImageSource & {width: number; height: number},
) => {
	const canvas = new OffscreenCanvas(source.width, source.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	ctx.drawImage(source, 0, 0);
	return ctx.getImageData(0, 0, source.width, source.height).data;
};

const toRows = (data: Uint8ClampedArray, width: number) => {
	const pixels: Rgb[] = [];
	for (let i = 0; i < data.length; i += 4) {
		pixels.push([data[i], data[i + 1], data[i + 2]]);
	}

	const rows: Rgb[][] = [];
	for (let i = 0; i < pixels.length; i += width) {
		rows.push(pixels.slice(i, i + width));
	}

	return rows;
};

// Expected layout after mediabunny's "rotate clockwise, then flip horizontally".
const cases = [
	{
		rotation: 0,
		flip: false,
		rows: [
			[RED, GREEN],
			[BLUE, WHITE],
		],
	},
	{
		rotation: 0,
		flip: true,
		rows: [
			[GREEN, RED],
			[WHITE, BLUE],
		],
	},
	{
		rotation: 90,
		flip: false,
		rows: [
			[BLUE, RED],
			[WHITE, GREEN],
		],
	},
	{
		rotation: 90,
		flip: true,
		rows: [
			[RED, BLUE],
			[GREEN, WHITE],
		],
	},
	{
		rotation: 180,
		flip: false,
		rows: [
			[WHITE, BLUE],
			[GREEN, RED],
		],
	},
	{
		rotation: 180,
		flip: true,
		rows: [
			[BLUE, WHITE],
			[RED, GREEN],
		],
	},
	{
		rotation: 270,
		flip: false,
		rows: [
			[GREEN, WHITE],
			[RED, BLUE],
		],
	},
	{
		rotation: 270,
		flip: true,
		rows: [
			[WHITE, GREEN],
			[BLUE, RED],
		],
	},
] as const;

for (const {rotation, flip, rows} of cases) {
	test(`rotateFrame() with rotation ${rotation} and flip ${flip} matches mediabunny's draw()`, async () => {
		const frame = makeFrame();
		const sample = new VideoSample(frame.clone(), {rotation, flip});
		try {
			const reference = new OffscreenCanvas(
				sample.displayWidth,
				sample.displayHeight,
			);
			const ctx = reference.getContext('2d');
			if (!ctx) {
				throw new Error('Could not get 2d context');
			}

			sample.draw(ctx, 0, 0);

			const bitmap = await rotateFrame({frame, rotation, flip});
			try {
				expect(toRows(readPixels(bitmap), bitmap.width)).toEqual(rows);
				expect([bitmap.width, bitmap.height]).toEqual([
					reference.width,
					reference.height,
				]);
				expect(readPixels(bitmap)).toEqual(readPixels(reference));
			} finally {
				bitmap.close();
			}
		} finally {
			sample.close();
			frame.close();
		}
	});
}
