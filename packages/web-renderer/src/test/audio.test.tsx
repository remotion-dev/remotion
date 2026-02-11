import {Audio, Video} from '@remotion/media';
import {ALL_FORMATS, BlobSource, Input, type InputAudioTrack} from 'mediabunny';
import {staticFile} from 'remotion';
import {expect, test, vi} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

const getAudioCodecFromBlob = async (
	blob: Blob,
): Promise<InputAudioTrack['codec']> => {
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(blob),
	});

	const tracks = await input.getTracks();
	const audioTrack = tracks.find((t) => t.isAudioTrack());

	if (!audioTrack) {
		throw new Error('No audio track found in rendered output');
	}

	return audioTrack.codec;
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

test('should fallback from AAC to Opus on Firefox', async (t) => {
	if (t.task.file.projectName !== 'firefox') {
		t.skip();
		return;
	}

	const warnSpy = vi.spyOn(console, 'warn');

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'fallback-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 10,
			calculateMetadata: null,
		},
		container: 'mp4',
		frameRange: [0, 1],
		logLevel: 'warn',
		outputTarget: 'arraybuffer',
	});

	expect(warnSpy).toHaveBeenCalledWith(
		expect.stringContaining('Falling back from audio codec "aac" to "opus"'),
	);
	warnSpy.mockRestore();

	const blob = await result.getBlob();
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe('opus');
});

test('should error when explicitly selecting AAC on Firefox', async (t) => {
	if (t.task.file.projectName !== 'firefox') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} />;
	};

	const prom = renderMediaOnWeb({
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

	await expect(prom).rejects.toThrow('cannot be encoded by this browser');
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

test.only('should render MP3 audio source', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return <Audio src={staticFile('sample-audio.mp3')} />;
	};

	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'mp3-encoding-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 300,
			calculateMetadata: null,
		},
		container: 'mp4',
		frameRange: [0, 299],
		logLevel: 'verbose',
		outputTarget: 'arraybuffer',
	});

	const blob = await result.getBlob();
	expect(blob.size).toBeGreaterThan(0);
	const audioCodec = await getAudioCodecFromBlob(blob);
	expect(audioCodec).toBe(
		t.task.file.projectName === 'firefox' ? 'opus' : 'aac',
	);
});
