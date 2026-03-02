import {test} from 'bun:test';
import fs from 'fs';
import path from 'path';
import {makeCancelSignal, renderMedia} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Cancelling after success should not throw error', async () => {
	const {cancel, cancelSignal} = makeCancelSignal();
	const outputLocation = 'out/render.mp4';
	await renderMedia({
		codec: 'h264',
		serveUrl: exampleBuild,
		composition: {
			durationInFrames: 4,
			fps: 30,
			height: 720,
			id: 'react-svg',
			width: 1280,
			defaultProps: {},
			props: {},
			defaultCodec: null,
			defaultOutName: null,
			defaultPixelFormat: null,
			defaultProResProfile: null,
			defaultVideoImageFormat: null,
		},
		concurrency: 1,
		outputLocation,
		cancelSignal,
	});

	cancel();

	await new Promise((resolve) => setTimeout(resolve, 2000));

	await fs.promises.rm(path.join(process.cwd(), outputLocation));
});
