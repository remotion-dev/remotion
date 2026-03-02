import {expect, test} from 'bun:test';
import path from 'path';
import {makeCancelSignal, renderStill} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Should be able to cancel render', async () => {
	try {
		const {cancel, cancelSignal} = makeCancelSignal();
		const val = renderStill({
			serveUrl: exampleBuild,
			composition: {
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
			},
			cancelSignal,
			output: 'out/hithere.png',
		});

		setTimeout(() => {
			cancel();
		}, 100);
		await val;

		throw new Error('Render should not succeed');
	} catch (err) {
		expect((err as Error).message).toContain('renderStill() got cancelled');
	}
});
