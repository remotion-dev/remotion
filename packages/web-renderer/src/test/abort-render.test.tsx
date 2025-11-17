import {assert, expect, test} from 'vitest';
import type {RenderMediaOnWebProgress} from '../render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';

test('should be able to cancel renderMediaOnWeb()', async () => {
	const Component: React.FC = () => {
		return null;
	};

	const controller = new AbortController();

	let currentProgress: RenderMediaOnWebProgress | null = null;

	const prom = renderMediaOnWeb({
		composition: {
			component: Component,
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 200,
		},
		onProgress(progress) {
			currentProgress = progress;
		},
		signal: controller.signal,
		inputProps: {},
	});

	await new Promise((resolve) => {
		setTimeout(resolve, 100);
	});

	controller.abort();
	await expect(prom).rejects.toThrow('renderMediaOnWeb() was cancelled');
	assert(currentProgress);
	const {encodedFrames, renderedFrames} = currentProgress;
	expect(encodedFrames).toBeGreaterThan(0);
	expect(renderedFrames).toBeGreaterThan(0);
	expect(encodedFrames).toBeLessThan(200);
});

test('should be able to cancel renderStillOnWeb()', async () => {
	const Component: React.FC = () => {
		return null;
	};

	const controller = new AbortController();

	const prom = renderStillOnWeb({
		frame: 0,
		imageFormat: 'png',
		composition: {
			component: Component,
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 200,
		},
		signal: controller.signal,
		inputProps: {},
	});

	controller.abort();
	await expect(prom).rejects.toThrow('renderStillOnWeb() was cancelled');
});
