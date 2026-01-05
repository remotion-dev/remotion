import {useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
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
