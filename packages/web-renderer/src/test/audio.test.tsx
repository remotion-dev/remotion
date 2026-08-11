import {Audio, Video} from '@remotion/media';
import {ALL_FORMATS, BlobSource, Input, type InputAudioTrack} from 'mediabunny';
import {staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

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

test(
	'should not be able to set toneFrequency on web rendering',
	{retry: 3},
	async (t) => {
		const Component: React.FC = () => {
			return <Audio src={staticFile('dialogue.wav')} toneFrequency={0.5} />;
		};

		await expect(async () => {
			const result = await renderMediaOnWeb({
				licenseKey: 'free-license',
				composition: {
					component: Component,
					id: 'audio',
					width: 100,
					height: 100,
					fps: 30,
					durationInFrames: 1,
					calculateMetadata: null,
				},
				outputTarget:
					t.task.file.projectName === 'webkit' ? 'arraybuffer' : 'web-fs',
			});
			throw new Error('Did resolve' + JSON.stringify(result));
		}).rejects.toThrow(
			'Setting the toneFrequency is not supported yet in web rendering.',
		);
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
