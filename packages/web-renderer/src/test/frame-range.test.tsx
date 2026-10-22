import {ALL_FORMATS, BlobSource, EncodedPacketSink, Input} from 'mediabunny';
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
	if (finalProgress === null) {
		throw new Error('Expected final progress to be reported');
	}

	const resolvedProgress = finalProgress as RenderMediaOnWebProgress;

	expect(resolvedProgress).toEqual({
		renderedFrames: 6,
		encodedFrames: 6,
		doneIn: expect.any(Number),
		renderEstimatedTime: 0,
		progress: 1,
	});
});

test('frameRange starting from non-zero should produce correct duration', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return null;
	};

	const fps = 30;
	// Render only the back half: frames 10-19 = 10 frames
	const frameRange: [number, number] = [10, 19];
	const expectedFrames = frameRange[1] - frameRange[0] + 1;
	const expectedDuration = expectedFrames / fps;

	const result = await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'frame-range-duration-test',
			width: 100,
			height: 100,
			fps,
			durationInFrames: 20,
		},
		inputProps: {},
		frameRange,
		outputTarget: 'arraybuffer',
		licenseKey: 'free-license',
		muted: true,
	});

	const blob = await result.getBlob();
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(blob),
	});

	const duration = await input.computeDuration();
	expect(duration).toBeCloseTo(expectedDuration, 5);
});

test.for([
	{frames: 1, fps: 30, replaceFrame: false},
	{frames: 2, fps: 30, replaceFrame: true},
	{frames: 61, fps: 30, replaceFrame: false},
	{frames: 7, fps: 24, replaceFrame: false},
	{frames: 7, fps: 60, replaceFrame: false},
])(
	'should preserve the final MP4 sample duration for $frames frames at $fps fps (replacement: $replaceFrame)',
	async ({frames, fps, replaceFrame}, t) => {
		if (t.task.file.projectName === 'webkit') {
			t.skip();
			return;
		}

		const result = await renderMediaOnWeb({
			composition: {
				component: () => null,
				id: 'final-sample-duration-test',
				width: 160,
				height: 96,
				fps,
				durationInFrames: frames,
			},
			inputProps: {},
			container: 'mp4',
			videoCodec: 'h264',
			muted: true,
			outputTarget: 'arraybuffer',
			licenseKey: 'free-license',
			onFrame: replaceFrame
				? (frame) => new VideoFrame(frame, {timestamp: frame.timestamp})
				: undefined,
		});

		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryVideoTrack();
		if (!track) {
			throw new Error('Expected a video track');
		}

		expect(await track.computeDuration()).toBeCloseTo(frames / fps, 5);
		let packetCount = 0;
		let finalDuration: number | null = null;
		for await (const packet of new EncodedPacketSink(track).packets()) {
			packetCount++;
			finalDuration = packet.duration;
		}

		expect(packetCount).toBe(frames);
		expect(finalDuration).toBeCloseTo(1 / fps, 5);
	},
);
