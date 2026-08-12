import {expect, test} from 'bun:test';
import {
	getCanvasCaptureSampleMoments,
	getCanvasCaptureScaleToSample,
	mapCanvasCapturePointToSample,
} from '../app/lib/canvas-capture-conversion';
import type {CanvasCaptureMouseMovement} from '../app/lib/canvas-capture-metadata';

const movement = (timeInSeconds: number): CanvasCaptureMouseMovement => ({
	timeInSeconds,
	canvasX: 0,
	canvasY: 0,
	cursor: 'pointer',
});

test('samples video frames and cursor changes while merging tiny deltas', () => {
	const moments = getCanvasCaptureSampleMoments({
		timestamp: 1,
		duration: 0.04,
		cursorStateChanges: [
			movement(0.5),
			movement(1.0005),
			movement(1.01),
			movement(1.0104),
			{timeInSeconds: 1.02},
			movement(1.0395),
			movement(1.05),
		],
	});

	expect(
		moments.map(({timestamp, cursorLookupTimestamp}) => ({
			timestamp,
			cursorLookupTimestamp,
		})),
	).toEqual([
		{
			timestamp: 1,
			cursorLookupTimestamp: 1.0005,
		},
		{
			timestamp: 1.01,
			cursorLookupTimestamp: 1.0104,
		},
		{
			timestamp: 1.02,
			cursorLookupTimestamp: 1.02,
		},
	]);
	expect(moments[0].duration).toBeCloseTo(0.01);
	expect(moments[1].duration).toBeCloseTo(0.01);
	expect(moments[2].duration).toBeCloseTo(0.02);
});

test('maps cursor coordinates through rotation, crop, and resize', () => {
	expect(
		mapCanvasCapturePointToSample({
			x: 25,
			y: 20,
			sourceDimensions: {width: 100, height: 50},
			rotation: 90,
			crop: {left: 10, top: 10, width: 30, height: 80},
			sampleDimensions: {width: 300, height: 400},
		}),
	).toEqual({x: 200, y: 75});
	expect(
		getCanvasCaptureScaleToSample({
			sourceDimensions: {width: 100, height: 50},
			rotation: 90,
			crop: {left: 10, top: 10, width: 30, height: 80},
			sampleWidth: 300,
		}),
	).toBe(10);
});
