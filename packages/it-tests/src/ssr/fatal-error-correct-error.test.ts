import {renderMedia} from '@remotion/renderer';
import {expect, test} from 'bun:test';

test('Fatal error on frame 10 should yield correct error', async () => {
	await expect(() => {
		return renderMedia({
			codec: 'h264',
			serveUrl:
				'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
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
			},
			logLevel: 'error',
			outputLocation: 'out/render.mp4',
		});
	}).toThrow(/Invalid array length/);
});
