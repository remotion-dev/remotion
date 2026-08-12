import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getCanvasCaptureImport} from '../helpers/get-canvas-capture-import';

test('reads duration and interactions from a Canvas Capture video', async () => {
	const fileContents = readFileSync(
		path.join(
			__dirname,
			'../../../brand/public/remotion-capture-editor-starter.mp4',
		),
	);
	const bytes = new Uint8Array(fileContents.length);
	bytes.set(fileContents);
	const file = new File([bytes], 'canvas-capture.mp4', {
		type: 'video/mp4',
	});
	const result = await getCanvasCaptureImport(file);

	if (result === null) {
		throw new Error('Expected Canvas Capture metadata');
	}

	expect(result.durationInSeconds).toBeCloseTo(8.7255, 4);
	expect(result.width).toBe(3026);
	expect(result.height).toBe(1386);
	expect(result.data.captureMetadata.density).toBe(6);
	expect(result.data.mouseMovements.length).toBeGreaterThan(50);
	expect(result.data.pointerClicks).toHaveLength(4);
});
