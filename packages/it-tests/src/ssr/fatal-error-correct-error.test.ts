import {expect, test} from 'bun:test';
import path from 'path';
import {renderMedia} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Fatal error on frame 10 should yield correct error', async () => {
	await expect(() => {
		return renderMedia({
			codec: 'h264',
			serveUrl: exampleBuild,
			composition: {
				durationInFrames: 1000000,
				fps: 30,
				height: 720,
				id: 'error-on-frame-10',
				width: 1280,
				defaultProps: {},
				props: {},
				defaultCodec: null,
				defaultOutName: null,
				defaultVideoImageFormat: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
			},
			logLevel: 'error',
			outputLocation: 'out/render.mp4',
		});
	}).toThrow(/Invalid array length/);
});
