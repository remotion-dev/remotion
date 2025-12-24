import {Audio, Video} from '@remotion/media';
import {staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';

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
