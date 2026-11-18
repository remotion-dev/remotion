import {Artifact, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {canRenderMediaOnWeb} from '../can-render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';
import {backgroundColor} from './fixtures/background-color';
import '../symbol-dispose';

test('onFrame callback returning same frame should work', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let frameCount = 0;

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<div style={{width: 100, height: 100, backgroundColor: 'blue'}}>
				Frame {frame}
			</div>
		);
	};

	await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'on-frame-same-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 3,
		},
		inputProps: {},
		onFrame: (frame) => {
			frameCount++;
			// Return the same frame
			return frame;
		},
	});

	expect(frameCount).toBe(3);
});

test('onFrame callback returning new frame with correct dimensions and timestamp should work', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let frameCount = 0;

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<div style={{width: 100, height: 100, backgroundColor: 'yellow'}}>
				Frame {frame}
			</div>
		);
	};

	await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'on-frame-new-valid-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 3,
		},
		inputProps: {},
		onFrame: (frame) => {
			frameCount++;
			// Create a new canvas with the same dimensions
			const canvas = new OffscreenCanvas(100, 100);
			const ctx = canvas.getContext('2d')!;
			ctx.fillStyle = 'purple';
			ctx.fillRect(0, 0, 100, 100);

			// Create new frame with same timestamp and dimensions
			const newFrame = new VideoFrame(canvas, {
				timestamp: frame.timestamp,
			});

			return newFrame;
		},
	});

	expect(frameCount).toBe(3);
});

test('onFrame callback returning frame with wrong dimensions should throw', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<div style={{width: 100, height: 100, backgroundColor: 'red'}}>
				Frame {frame}
			</div>
		);
	};

	await expect(async () => {
		await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'on-frame-wrong-dimensions-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 2,
			},
			inputProps: {},
			onFrame: (frame) => {
				// Create a frame with wrong dimensions
				const canvas = new OffscreenCanvas(200, 200);
				const ctx = canvas.getContext('2d')!;
				ctx.fillStyle = 'red';
				ctx.fillRect(0, 0, 200, 200);

				const newFrame = new VideoFrame(canvas, {
					timestamp: frame.timestamp,
				});

				return newFrame;
			},
		});
	}).rejects.toThrow(
		/VideoFrame dimensions mismatch: expected 100x100, got 0x0/,
	);
});

for (const failure of [
	'callback-throw',
	'callback-abort',
	'replacement-abort',
	'wrong-dimensions',
	'wrong-timestamp',
	'progress-throw',
	'artifact-throw',
] as const) {
	test(`releases callback frames after ${failure}`, async (context) => {
		const capability = await canRenderMediaOnWeb({
			width: backgroundColor.width,
			height: backgroundColor.height,
			muted: true,
		});
		const unavailable = capability.issues.filter(
			(issue) =>
				issue.severity === 'error' &&
				(issue.type === 'video-codec-unsupported' ||
					issue.type === 'webcodecs-unavailable'),
		);
		if (unavailable.length !== 0) {
			context.skip(unavailable.map((issue) => issue.message).join('; '));
			return;
		}

		expect(capability.canRender).toBe(true);
		const controller = new AbortController();
		const originals: VideoFrame[] = [];
		const replacements: VideoFrame[] = [];
		const children = [...document.body.children];
		const Background = backgroundColor.component;
		const WithArtifact = () => (
			<>
				<Background />
				<Artifact filename="lifetime.txt" content="frame lifetime" />
			</>
		);
		const expected =
			failure === 'wrong-dimensions'
				? /VideoFrame dimensions mismatch/
				: failure === 'wrong-timestamp'
					? /VideoFrame timestamp mismatch/
					: failure.endsWith('abort')
						? /renderMediaOnWeb\(\) was cancelled/
						: /frame lifetime failure/;
		try {
			await expect(
				renderMediaOnWeb({
					licenseKey: 'free-license',
					composition: {
						...backgroundColor,
						component: failure === 'artifact-throw' ? WithArtifact : Background,
					},
					inputProps: {},
					muted: true,
					allowHtmlInCanvas: false,
					signal: controller.signal,
					onFrame: (frame) => {
						originals.push(frame);
						if (failure === 'callback-throw') {
							throw new Error('frame lifetime failure');
						}

						let returned = frame;
						if (
							failure === 'replacement-abort' ||
							failure === 'wrong-dimensions' ||
							failure === 'wrong-timestamp'
						) {
							const canvas = new OffscreenCanvas(
								failure === 'wrong-dimensions' ? 100 : frame.displayWidth,
								frame.displayHeight,
							);
							try {
								canvas
									.getContext('2d')!
									.fillRect(0, 0, canvas.width, canvas.height);
								returned = new VideoFrame(canvas, {
									timestamp:
										frame.timestamp + (failure === 'wrong-timestamp' ? 1 : 0),
								});
								replacements.push(returned);
							} finally {
								canvas.width = 0;
								canvas.height = 0;
							}
						}

						if (failure.endsWith('abort')) controller.abort();
						return returned;
					},
					onProgress: (progress) => {
						if (failure === 'progress-throw' && progress.renderedFrames > 0) {
							throw new Error('frame lifetime failure');
						}
					},
					onArtifact: () => {
						if (failure === 'artifact-throw') {
							throw new Error('frame lifetime failure');
						}
					},
				}),
			).rejects.toThrow(expected);
			expect(originals).toHaveLength(1);
			expect(
				[...originals, ...replacements].map((frame) => frame.codedWidth),
			).toEqual([...originals, ...replacements].map(() => 0));
			expect([...document.body.children]).toEqual(children);
		} finally {
			controller.abort();
			for (const frame of [...originals, ...replacements]) frame.close();
		}
	});
}
