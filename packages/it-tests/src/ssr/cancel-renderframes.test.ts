import {
	ensureBrowser,
	makeCancelSignal,
	renderFrames,
} from '@remotion/renderer';
import {beforeAll, expect, test} from 'bun:test';

beforeAll(async () => {
	await ensureBrowser();
});

test('Should be able to cancel render', async () => {
	try {
		const {cancel, cancelSignal} = makeCancelSignal();
		const val = renderFrames({
			serveUrl:
				'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
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
			},
			cancelSignal,
			imageFormat: 'jpeg',
			inputProps: {},
			onFrameUpdate: () => undefined,
			onStart: () => undefined,
			outputDir: null,
		});

		setTimeout(() => {
			cancel();
		}, 1000);
		await val;

		throw new Error('Render should not succeed');
	} catch (err) {
		expect((err as Error).message).toContain('renderFrames() got cancelled');
	}
});
