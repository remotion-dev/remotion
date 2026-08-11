import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
	CANVAS_CAPTURE_METADATA_TAG,
	parseCanvasCaptureData,
} from '@remotion/studio-shared';
import {generateCanvasCaptureComposition} from '../canvas-capture/generate-canvas-capture-composition';

test('generates the ideal interactive Canvas Capture composition markup', async () => {
	const fixtureDirectory = path.join(__dirname, 'fixtures');
	const metadata = readFileSync(
		path.join(fixtureDirectory, 'canvas-capture-metadata.json'),
		'utf-8',
	);
	const data = parseCanvasCaptureData({
		raw: {[CANVAS_CAPTURE_METADATA_TAG]: metadata},
	});
	if (data === null) {
		throw new Error('Could not parse the Canvas Capture metadata fixture');
	}

	const generated = await generateCanvasCaptureComposition({
		componentName: 'CanvasCaptureComposition',
		compositionId: 'canvas-capture-promo',
		data,
		durationInFrames: 500,
		fps: 60,
		height: 1080,
		keyframeFps: 30,
		videoFileName: 'remotion-capture-editor-starter.mp4',
		width: 1920,
	});
	const expected = readFileSync(
		path.join(fixtureDirectory, 'canvas-capture-composition.txt'),
		'utf-8',
	);

	expect(generated).toBe(expected);
});
