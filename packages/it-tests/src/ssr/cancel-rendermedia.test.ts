import {expect, test} from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
	makeCancelSignal,
	renderFrames,
	renderMedia,
	renderStill,
} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Renderer APIs should handle cancellation throughout a render', async () => {
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-cancellation-'),
	);
	const composition = {
		durationInFrames: 1000000,
		fps: 30,
		height: 720,
		id: 'react-svg',
		width: 1280,
		defaultProps: {},
		props: {},
		defaultCodec: null,
		defaultOutName: null,
		defaultVideoImageFormat: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
	};

	try {
		const framesCancellation = makeCancelSignal();
		const mediaCancellation = makeCancelSignal();
		const stillCancellation = makeCancelSignal();

		const framesRender = renderFrames({
			serveUrl: exampleBuild,
			composition,
			cancelSignal: framesCancellation.cancelSignal,
			imageFormat: 'jpeg',
			inputProps: {},
			onFrameUpdate: () => undefined,
			onStart: () => undefined,
			outputDir: null,
		});
		const mediaRender = renderMedia({
			codec: 'h264',
			serveUrl: exampleBuild,
			composition,
			outputLocation: path.join(outputDir, 'cancelled-media.mp4'),
			cancelSignal: mediaCancellation.cancelSignal,
		});
		const stillRender = renderStill({
			serveUrl: exampleBuild,
			composition,
			cancelSignal: stillCancellation.cancelSignal,
			output: path.join(outputDir, 'cancelled-still.png'),
		});
		setTimeout(framesCancellation.cancel, 1000);
		setTimeout(mediaCancellation.cancel, 1000);
		setTimeout(stillCancellation.cancel, 100);

		const [framesError, mediaError, stillError] = await Promise.all([
			framesRender.then(
				() => null,
				(error) => error,
			),
			mediaRender.then(
				() => null,
				(error) => error,
			),
			stillRender.then(
				() => null,
				(error) => error,
			),
		]);

		expect((framesError as Error | null)?.message).toContain(
			'renderFrames() got cancelled',
		);
		expect((mediaError as Error | null)?.message).toContain(
			'renderMedia() got cancelled',
		);
		expect((stillError as Error | null)?.message).toContain(
			'renderStill() got cancelled',
		);
	} finally {
		await fs.promises.rm(outputDir, {recursive: true});
	}
});
