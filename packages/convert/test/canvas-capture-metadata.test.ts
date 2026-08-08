import {expect, test} from 'bun:test';
import {
	CAPTURE_METADATA_TAG_KEY,
	parseCanvasCaptureCursorData,
} from '../app/lib/canvas-capture-metadata';

test('parses cursor data embedded by the canvas capture extension', () => {
	const cursorData = parseCanvasCaptureCursorData({
		raw: {
			[CAPTURE_METADATA_TAG_KEY]: JSON.stringify({
				startedAt: 100,
				endedAt: 2100,
				captureMetadata: {
					density: 2,
					canvasSize: {width: 1920, height: 1080},
				},
				mouseMovements: [
					{
						timeInSeconds: 0.5,
						clientX: 100,
						clientY: 150,
						canvasX: 200,
						canvasY: 300,
						cursor: 'pointer',
					},
				],
			}),
		},
	});

	expect(cursorData).toEqual({
		captureMetadata: {density: 2},
		mouseMovements: [
			{
				timeInSeconds: 0.5,
				canvasX: 200,
				canvasY: 300,
				cursor: 'pointer',
			},
		],
	});

	expect(
		parseCanvasCaptureCursorData({
			raw: {[CAPTURE_METADATA_TAG_KEY]: '{not JSON'},
		}),
	).toBeNull();
	expect(parseCanvasCaptureCursorData({title: 'Regular video'})).toBeNull();
});
