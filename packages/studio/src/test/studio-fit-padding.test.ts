import {expect, test} from 'bun:test';
import type {Size} from '@remotion/player';
import {
	calculateStudioCanvasTransformation,
	calculateStudioScale,
	STUDIO_FIT_PADDING,
} from '../helpers/studio-fit-padding';

const makeCanvasSize = (width: number, height: number): Size => ({
	width,
	height,
	left: 0,
	top: 0,
	windowSize: {width, height},
	refresh: () => undefined,
});

test('adds a 16px horizontal gutter when fitting by width', () => {
	const canvasSize = makeCanvasSize(1000, 600);
	const transformation = calculateStudioCanvasTransformation({
		canvasSize,
		compositionHeight: 1080,
		compositionWidth: 1920,
		previewSize: 'auto',
	});

	expect(transformation.scale).toBeCloseTo((1000 - 32) / 1920);
	expect(transformation.centerX).toBe(STUDIO_FIT_PADDING);
	expect(transformation.centerY).toBeCloseTo(
		(600 - 1080 * transformation.scale) / 2,
	);
});

test('adds a 16px vertical gutter when fitting by height', () => {
	const canvasSize = makeCanvasSize(1000, 500);
	const transformation = calculateStudioCanvasTransformation({
		canvasSize,
		compositionHeight: 1080,
		compositionWidth: 1920,
		previewSize: 'auto',
	});

	expect(transformation.scale).toBeCloseTo((500 - 32) / 1080);
	expect(transformation.centerX).toBeCloseTo(
		(1000 - 1920 * transformation.scale) / 2,
	);
	expect(transformation.centerY).toBe(STUDIO_FIT_PADDING);
});

test('does not add padding to explicit zoom levels', () => {
	const canvasSize = makeCanvasSize(1000, 600);
	const transformation = calculateStudioCanvasTransformation({
		canvasSize,
		compositionHeight: 1080,
		compositionWidth: 1920,
		previewSize: 0.5,
	});

	expect(transformation.scale).toBe(0.5);
	expect(transformation.centerX).toBe(20);
	expect(transformation.centerY).toBe(30);
	expect(
		calculateStudioScale({
			canvasSize,
			compositionHeight: 1080,
			compositionWidth: 1920,
			previewSize: 0.5,
		}),
	).toBe(0.5);
});
