import {Audio, Video} from '@remotion/media';
import {staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';

test.only('should not be able to set toneFrequency on web rendering', async () => {
	const Component: React.FC = () => {
		return <Audio src={staticFile('dialogue.wav')} toneFrequency={0.5} />;
	};

	await expect(async () => {
		await renderMediaOnWeb({
			composition: {
				component: Component,
				id: 'audio',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 1,
				calculateMetadata: null,
			},
		});
	}).rejects.toThrow(
		'Setting the toneFrequency is not supported yet in web rendering.',
	);
});

test.only('should be able to render 2 audios', async () => {
	const Component: React.FC = () => {
		return (
			<>
				<Video src={staticFile('video.mp4')} />
				<Audio src={staticFile('dialogue.wav')} />
			</>
		);
	};

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'audio',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 1,
			calculateMetadata: null,
		},
		logLevel: 'info',
	});
});
