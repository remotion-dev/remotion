import {Video} from '@remotion/media';
import {Input} from 'mediabunny';
import {staticFile} from 'remotion';
import {expect, test, vi} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import * as telemetry from '../send-telemetry-event';
import '../symbol-dispose';

vi.mock('../send-telemetry-event', {spy: true});

test('should be able to cancel renderMediaOnWeb()', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Video src={staticFile('video.mp4')} />;
	};

	const disposeSpy = vi.spyOn(Input.prototype, 'dispose');
	const controller = new AbortController();

	const prom = renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'abort-render-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 200,
		},
		signal: controller.signal,
		inputProps: {},
		onProgress: ({renderedFrames}) => {
			if (renderedFrames === 1) {
				controller.abort();
			}
		},
	});

	try {
		await expect(prom).rejects.toThrow('renderMediaOnWeb() was cancelled');
		expect(disposeSpy).toHaveBeenCalled();
	} finally {
		disposeSpy.mockRestore();
	}
});

test('should be able to cancel renderStillOnWeb()', async () => {
	const Component: React.FC = () => {
		return null;
	};

	const controller = new AbortController();

	const prom = renderStillOnWeb({
		licenseKey: 'free-license',
		frame: 0,
		composition: {
			component: Component,
			id: 'abort-render-test',
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

test('should not send failed telemetry when renderMediaOnWeb() is aborted', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	vi.mocked(telemetry.sendUsageEvent).mockClear();

	const Component: React.FC = () => {
		return null;
	};

	const controller = new AbortController();

	const prom = renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'abort-telemetry-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 200,
		},
		signal: controller.signal,
		inputProps: {},
	});

	await new Promise((resolve) => {
		setTimeout(resolve, 200);
	});

	controller.abort();
	await expect(prom).rejects.toThrow('renderMediaOnWeb() was cancelled');

	expect(vi.mocked(telemetry.sendUsageEvent).mock.calls.length).toBe(0);
});

test('should not send failed telemetry when renderStillOnWeb() is aborted', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	vi.mocked(telemetry.sendUsageEvent).mockClear();

	const Component: React.FC = () => {
		return null;
	};

	const controller = new AbortController();

	const prom = renderStillOnWeb({
		licenseKey: 'free-license',
		frame: 0,
		composition: {
			component: Component,
			id: 'abort-telemetry-test',
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

	expect(vi.mocked(telemetry.sendUsageEvent).mock.calls.length).toBe(0);
});
