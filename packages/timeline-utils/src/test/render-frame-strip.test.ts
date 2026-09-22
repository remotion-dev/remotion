import {expect, test} from 'bun:test';
import {drawSlot, WEBCODECS_TIMESCALE} from '../render-frame-strip';

test('filmstrip thumbnails keep their global position after a split', () => {
	const frame = {
		displayHeight: 52,
		displayWidth: 92,
		timestamp: 2 * WEBCODECS_TIMESCALE,
	} as VideoFrame;
	const pixelsPerSecond = 133.8;
	const splitAtSeconds = 1.1;
	const drawPositions: number[] = [];
	const ctx = {
		drawImage: (...args: unknown[]) => {
			drawPositions.push(args[1] as number);
		},
	} as unknown as CanvasRenderingContext2D;

	drawSlot({
		ctx,
		devicePixelRatio: 1,
		filledSlots: new Map(),
		frame,
		frameHeight: frame.displayHeight,
		fromSeconds: 0,
		segmentDuration: 3,
		timestamp: frame.timestamp,
		visualizationWidth: pixelsPerSecond * 3,
	});
	drawSlot({
		ctx,
		devicePixelRatio: 1,
		filledSlots: new Map(),
		frame,
		frameHeight: frame.displayHeight,
		fromSeconds: splitAtSeconds,
		segmentDuration: 3 - splitAtSeconds,
		timestamp: frame.timestamp,
		visualizationWidth: pixelsPerSecond * (3 - splitAtSeconds),
	});

	const [positionBeforeSplit, positionAfterSplit] = drawPositions;
	expect(positionAfterSplit + splitAtSeconds * pixelsPerSecond).toBeCloseTo(
		positionBeforeSplit,
		10,
	);
});
