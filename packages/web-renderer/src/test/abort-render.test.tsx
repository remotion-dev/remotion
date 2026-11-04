import {Audio, Video} from '@remotion/media';
import {Input} from 'mediabunny';
import {useEffect} from 'react';
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

test('should render successfully after aborting during media extraction', async (t) => {
	if (t.task.file.projectName !== 'firefox') {
		t.skip();
		return;
	}

	const controller = new AbortController();
	const AbortingComponent: React.FC = () => {
		useEffect(() => {
			const timeout = setTimeout(() => controller.abort(), 0);

			return () => clearTimeout(timeout);
		}, []);

		return (
			<>
				<Video src={staticFile('video.mp4')} />
				<Audio src={staticFile('dialogue.wav')} />
			</>
		);
	};

	await expect(
		renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: AbortingComponent,
				id: 'abort-during-media-extraction',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 10,
			},
			signal: controller.signal,
			container: 'webm',
			videoCodec: 'vp8',
			outputTarget: 'arraybuffer',
			inputProps: {},
		}),
	).rejects.toThrow('renderMediaOnWeb() was cancelled');

	const SuccessfulComponent: React.FC = () => {
		return (
			<>
				<Video src={staticFile('video.mp4')} />
				<Audio src={staticFile('dialogue.wav')} />
			</>
		);
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: SuccessfulComponent,
			id: 'render-after-abort',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 1,
		},
		frameRange: [0, 0],
		container: 'webm',
		videoCodec: 'vp8',
		outputTarget: 'arraybuffer',
		inputProps: {},
	});

	expect((await result.getBlob()).size).toBeGreaterThan(0);
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

test.for(['error', 'cancel'] as const)(
	'waits for the output stream to close after %s',
	async (mode, t) => {
		if (t.task.file.projectName === 'webkit') {
			t.skip();
			return;
		}

		const controller = new AbortController();
		let finishClose!: () => void;
		let startClose!: () => void;
		const closeStarted = new Promise<void>((resolve) => {
			startClose = resolve;
		});
		const closeFinished = new Promise<void>((resolve) => {
			finishClose = resolve;
		});
		const outputWritable = new WritableStream({
			close: () => {
				startClose();
				return closeFinished;
			},
		});
		const error = new Error('Deliberate frame failure');
		let settled = false;
		const result = renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: () => null,
				id: 'await-output-cleanup',
				width: 64,
				height: 64,
				fps: 30,
				durationInFrames: 3,
			},
			container: 'webm',
			videoCodec: 'vp8',
			outputWritable,
			signal: controller.signal,
			onFrame: (frame) => {
				if (mode === 'error') {
					frame.close();
					throw error;
				}

				controller.abort();
				return frame;
			},
		}).then(
			() => {
				settled = true;
				return null;
			},
			(rejection: unknown) => {
				settled = true;
				return rejection;
			},
		);

		try {
			await closeStarted;
			// Let render rejection settle if cleanup was started without being awaited.
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(settled).toBe(false);
		} finally {
			finishClose();
		}

		const reason = await result;
		if (mode === 'error') {
			expect(reason).toBe(error);
		} else {
			expect(reason).toBeInstanceOf(Error);
			expect((reason as Error).message).toBe(
				'renderMediaOnWeb() was cancelled',
			);
		}
	},
);
