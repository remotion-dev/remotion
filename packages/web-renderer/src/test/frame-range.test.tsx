import {expect, test} from 'vitest';
import type {RenderMediaOnWebProgress} from '../render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

test('should reject with invalid frame range', async (t) => {
	const Component: React.FC = () => {
		return null;
	};

	const prom = renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'frame-range-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 20,
		},
		inputProps: {},
		frameRange: [-10, 50],
		outputTarget:
			t.task.file.projectName === 'webkit' ? 'arraybuffer' : 'web-fs',
		licenseKey: 'free-license',
	});
	await expect(prom).rejects.toThrow(
		'The "durationInFrames" of the composition was evaluated to be 20, but frame range -10-50 is not inbetween 0-19',
	);
});

test('should render with valid frame range', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return null;
	};

	let finalProgress: RenderMediaOnWebProgress | null = null;

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'frame-range-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 20,
		},
		onProgress: (progress) => {
			finalProgress = progress;
		},
		inputProps: {},
		frameRange: [10, 15],
		licenseKey: 'free-license',
	});
	expect(finalProgress).toEqual({
		renderedFrames: 6,
		encodedFrames: 6,
	});
});
