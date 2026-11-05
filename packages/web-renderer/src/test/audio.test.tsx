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
