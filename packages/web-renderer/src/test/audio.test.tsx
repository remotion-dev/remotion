import {blur} from '@remotion/effects/blur';
import {Audio, Video} from '@remotion/media';
import {
	ALL_FORMATS,
	AudioBufferSink,
	BlobSource,
	Input,
	type InputAudioTrack,
} from 'mediabunny';
import {AnimatedImage, CanvasImage, Img, Sequence, staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';
import {fractionalAudio} from './fixtures/fractional-audio';
import {makeToneWav} from './fixtures/pitch-shift-audio';

const getAudioTrackFromBlob = async (blob: Blob): Promise<InputAudioTrack> => {
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(blob),
	});

	const tracks = await input.getTracks();
	const audioTrack = tracks.find((t) => t.isAudioTrack());

	if (!audioTrack) {
		throw new Error('No audio track found in rendered output');
	}

	return audioTrack;
};

const getAudioCodecFromBlob = async (
	blob: Blob,
): Promise<InputAudioTrack['codec']> => {
	const track = await getAudioTrackFromBlob(blob);
	return track.codec;
};

test.each([
	{container: 'wav', startFrame: 0},
	{container: 'mkv', startFrame: 0},
	{container: 'wav', startFrame: 2},
	{container: 'mkv', startFrame: 2},
] as const)(
	'preserves fractional audio windows and integer video frames in $container from frame $startFrame',
	async ({container, startFrame}) => {
		let videoFrames = 0;
		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {...fractionalAudio, calculateMetadata: null},
			frameRange: [startFrame, 3],
			container,
			audioCodec: 'pcm-s16',
			videoCodec: 'vp8',
			sampleRate: 48000,
			outputTarget: 'arraybuffer',
			onFrame: async (frame) => {
				expect(frame.timestamp).toBe(
					Math.round((videoFrames / 24) * 1_000_000),
				);
				const pixels = new Uint8Array(64 * 64 * 4);
				// Read native packed bytes without requiring a browser color conversion.
				const {format} = frame;
				expect(['RGBA', 'RGBX', 'BGRA', 'BGRX']).toContain(format);
				const native = new Uint8Array(frame.allocationSize());
				const [plane] = await frame.copyTo(native);
				const blueFirst = format === 'BGRA' || format === 'BGRX';
				const opaque = format === 'RGBX' || format === 'BGRX';
				for (let y = 0; y < 64; y++) {
					for (let x = 0; x < 64; x++) {
						const from = plane.offset + y * plane.stride + x * 4;
						const to = (y * 64 + x) * 4;
						pixels[to] = native[from + (blueFirst ? 2 : 0)];
						pixels[to + 1] = native[from + 1];
						pixels[to + 2] = native[from + (blueFirst ? 0 : 2)];
						pixels[to + 3] = opaque ? 255 : native[from + 3];
					}
				}

				const absoluteFrame = startFrame + videoFrames;
				const background = [32 + absoluteFrame * 24, 64, 128];
				const loopColor = [224, 32, 96];
				let wrongPixels = 0;
				for (let i = 0; i < pixels.length; i += 4) {
					const inLoop =
						absoluteFrame === 3 && (i / 4) % 64 < 16 && i < 16 * 64 * 4;
					const expected = inLoop ? loopColor : background;
					if (
						pixels[i] !== expected[0] ||
						pixels[i + 1] !== expected[1] ||
						pixels[i + 2] !== expected[2] ||
						pixels[i + 3] !== 255
					)
						wrongPixels++;
				}

				expect(wrongPixels).toBe(0);
				videoFrames++;
				return frame;
			},
		});
		expect(videoFrames).toBe(container === 'wav' ? 0 : 4 - startFrame);
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		expect(track).not.toBeNull();
		const samples = (4 - startFrame) * 2000;
		const channels = [new Float32Array(samples), new Float32Array(samples)];
		let totalSamples = 0;
		for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
			for (let channel = 0; channel < 2; channel++) {
				channels[channel].set(buffer.getChannelData(channel), totalSamples);
			}

			totalSamples += buffer.length;
		}

		expect(totalSamples).toBe(samples);
		// Independent sample-grid oracle from the authored intervals, not exports.
		const windows = [
			[0.25, 0.37, 0],
			[1.125, 1.538008, 0],
			[1.538008, 1.815008, 2000],
			[2.1, 2.5, 0],
			[2.5, 2.9, 0],
			[2.9, 3.3, 0],
			[3.3, 3.6, 0],
		];
		for (let channel = 0; channel < 2; channel++) {
			const expected = new Float32Array(8000);
			for (const [from, to, offset] of windows) {
				const start = Math.round(from * 2000);
				for (let sample = start; sample < Math.round(to * 2000); sample++) {
					expected[sample] =
						Math.round(
							Math.sin(
								((sample - start + offset) / 48000) *
									(channel === 0 ? 440 : 660) *
									Math.PI *
									2,
							) * 10000,
						) / 32768;
				}
			}

			let wrongSamples = 0;
			for (let i = 0; i < samples; i++) {
				if (channels[channel][i] !== expected[startFrame * 2000 + i])
					wrongSamples++;
			}

			expect(wrongSamples).toBe(0);
		}
	},
);

test('should be able to render 2 audios', async (t) => {
	if (t.task.file.projectName === 'chromium') {
		// Chromium in CI doesn't support video codec decoding in this test environment
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return (
			<>
				<Video src={staticFile('video.mp4')} />
				<Audio src={staticFile('dialogue.wav')} />
			</>
		);
	};

	await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'audio',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		frameRange: [0, 1],
		logLevel: 'info',
		outputTarget:
			t.task.file.projectName === 'webkit' ? 'arraybuffer' : 'web-fs',
	});
});

test('default audio codec is AAC on Chrome/WebKit for MP4', async (t) => {
	if (t.task.file.projectName === 'firefox') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'default-aac-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'mp4',
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe('aac');
});

test('should encode AAC when explicitly selected, even in Firefox', async () => {
	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'explicit-aac-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		audioCodec: 'aac',
		container: 'mp4',
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe('aac');
});

test('default audio codec is Opus for WebM', async () => {
	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'webm-opus-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'webm',
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe('opus');
});

test('explicit Opus selection produces Opus in MP4 output', async () => {
	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'explicit-opus-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'mp4',
		audioCodec: 'opus',
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe('opus');
});

test('should render AAC container with web-fs (audio-only)', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		// WebKit OPFS support is unreliable in test environments
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'aac-container-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'aac',
		frameRange: [0, 1],
		outputTarget: 'web-fs',
	});

	const blob = await result.getBlob();
	expect(blob.size).toBeGreaterThan(0);
});

test('should render audio at 44100 Hz when sampleRate is set', async (t) => {
	if (t.task.file.projectName === 'firefox') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'sample-rate-44100-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'mp4',
		sampleRate: 44100,
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const track = await getAudioTrackFromBlob(blob);
	expect(track.sampleRate).toBe(44100);
});

test('should render audio at default 48000 Hz when sampleRate is not set', async (t) => {
	if (t.task.file.projectName === 'firefox') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'sample-rate-default-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'mp4',
		frameRange: [0, 1],
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	const track = await getAudioTrackFromBlob(blob);
	expect(track.sampleRate).toBe(48000);
});

test.each([
	'Img',
	'Img with effects',
	'CanvasImage',
	'AnimatedImage',
	'looping AnimatedImage',
	'muted Video',
] as const)(
	'audio-only rendering ignores unavailable visual media (%s)',
	async (kind) => {
		const src = makeToneWav();
		const missingSrc = staticFile('missing-audio-only-image.png');
		const visual = {
			Img: <Img src={missingSrc} maxRetries={0} />,
			'Img with effects': (
				<Img
					src={missingSrc}
					width={100}
					height={100}
					effects={[blur({radius: 1})]}
					maxRetries={0}
				/>
			),
			CanvasImage: (
				<CanvasImage src={missingSrc} width={100} height={100} maxRetries={0} />
			),
			AnimatedImage: (
				<AnimatedImage
					src={missingSrc}
					width={100}
					height={100}
					durationInFrames={2}
				/>
			),
			'looping AnimatedImage': <AnimatedImage src={missingSrc} loop />,
			'muted Video': (
				<Video src={missingSrc} muted disallowFallbackToOffthreadVideo />
			),
		}[kind];
		const Component: React.FC = () => (
			<>
				<Audio src={src} />
				<Sequence from={1}>{visual}</Sequence>
			</>
		);

		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'audio-only-image',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 3,
				calculateMetadata: null,
			},
			container: 'wav',
			audioCodec: 'pcm-s16',
			sampleRate: 48000,
			outputTarget: 'arraybuffer',
		});

		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		expect(track).not.toBeNull();
		let totalSamples = 0;
		for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
			expect(buffer.numberOfChannels).toBe(2);
			expect(Math.max(...buffer.getChannelData(0))).toBeGreaterThan(0.3);
			totalSamples += buffer.length;
		}

		expect(totalSamples).toBe(4800);
	},
);
