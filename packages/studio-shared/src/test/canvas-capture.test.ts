import {expect, test} from 'bun:test';
import {
	CANVAS_CAPTURE_METADATA_TAG,
	parseCanvasCaptureData,
} from '../canvas-capture';

test('parses Canvas Capture cursor and pointer metadata', () => {
	const parsed = parseCanvasCaptureData({
		raw: {
			[CANVAS_CAPTURE_METADATA_TAG]: JSON.stringify({
				captureMetadata: {density: 2},
				mouseMovements: [
					{
						timeInSeconds: 1,
						canvasX: 20,
						canvasY: 30,
						cursor: 'pointer',
					},
				],
				pointerClicks: [
					{timeInSeconds: 1.2, type: 'pointer-down'},
					{timeInSeconds: 1.4, type: 'pointer-up'},
				],
			}),
		},
	});

	expect(parsed).toEqual({
		captureMetadata: {density: 2},
		mouseMovements: [
			{
				timeInSeconds: 1,
				canvasX: 20,
				canvasY: 30,
				cursor: 'pointer',
			},
		],
		pointerClicks: [
			{timeInSeconds: 1.2, type: 'pointer-down'},
			{timeInSeconds: 1.4, type: 'pointer-up'},
		],
	});
});

test('rejects malformed Canvas Capture metadata', () => {
	expect(parseCanvasCaptureData(null)).toBeNull();
	expect(
		parseCanvasCaptureData({
			raw: {[CANVAS_CAPTURE_METADATA_TAG]: '{invalid'},
		}),
	).toBeNull();
	expect(
		parseCanvasCaptureData({
			raw: {
				[CANVAS_CAPTURE_METADATA_TAG]: JSON.stringify({
					captureMetadata: {density: 2},
					mouseMovements: [],
				}),
			},
		}),
	).toBeNull();
});
