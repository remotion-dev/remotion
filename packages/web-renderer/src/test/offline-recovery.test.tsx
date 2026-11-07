import {Audio, Video} from '@remotion/media';
import {staticFile} from 'remotion';
import {expect, test, vi} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

// PR #12021: exercise both extraction handles and the outer readiness deadline.
// Inject the browser's offline signals while keeping the real export pipeline.
test('resumes the same export after an outage longer than both deadlines', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let offline = true;
	let failedRequests = 0;
	const online = vi
		.spyOn(navigator, 'onLine', 'get')
		.mockImplementation(() => !offline);
	const originalFetch = globalThis.fetch.bind(globalThis);
	const fetchSpy = vi
		.spyOn(globalThis, 'fetch')
		.mockImplementation((url, init) => {
			if (offline && String(url).includes('offline-recovery')) {
				failedRequests++;
				return Promise.reject(new TypeError('Failed to fetch'));
			}

			return originalFetch(url, init);
		});
	// Leave 3 seconds for extraction after reconnecting on a shared CI runner.
	// The 6.5-second outage still exceeds this and the 5.5-second readiness deadline.
	const Component: React.FC = () => (
		<>
			<Video
				src={staticFile('video.mp4') + '?offline-recovery'}
				delayRenderTimeoutInMilliseconds={5000}
			/>
			<Audio
				src={staticFile('dialogue.wav') + '?offline-recovery'}
				delayRenderTimeoutInMilliseconds={5000}
			/>
		</>
	);
	const controller = new AbortController();
	const options = {
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'offline-recovery',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 3,
		},
		container: 'webm' as const,
		videoCodec: 'vp8' as const,
		audioCodec: 'opus' as const,
		outputTarget: 'arraybuffer' as const,
		delayRenderTimeoutInMilliseconds: 2500,
		inputProps: {},
	};
	let settled = false;
	const pending = renderMediaOnWeb({...options, signal: controller.signal});
	pending.then(
		() => {
			settled = true;
		},
		() => {
			settled = true;
		},
	);
	try {
		await vi.waitFor(() => expect(failedRequests).toBeGreaterThanOrEqual(2));
		await new Promise((resolve) => setTimeout(resolve, 6500));
		expect(settled).toBe(false);
		offline = false;
		window.dispatchEvent(new Event('online'));
		expect((await (await pending).getBlob()).size).toBeGreaterThan(0);

		// A second offline export must be cancellable without an online event.
		offline = true;
		failedRequests = 0;
		const cancelled = renderMediaOnWeb({...options, signal: controller.signal});
		const rejection = expect(cancelled).rejects.toThrow(
			'renderMediaOnWeb() was cancelled',
		);
		await vi.waitFor(() => expect(failedRequests).toBeGreaterThanOrEqual(2));
		controller.abort();
		await rejection;
	} finally {
		controller.abort();
		await pending.catch(() => undefined);
		online.mockRestore();
		fetchSpy.mockRestore();
	}
}, 20000);
