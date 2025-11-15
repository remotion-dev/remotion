import {Video} from '@remotion/media';
import {AbsoluteFill, staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('can extract a video frame', async (t) => {
	if (t.task.file.projectName === 'chromium') {
		// Chromium in CI doesn't support video codec decoding in this test environment
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Video style={{height: '100%'}} src={staticFile('video.mp4')} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 25,
		width: 1920 / 3,
		height: 1080 / 3,
		frame: 20,
		inputProps: {},
		imageFormat: 'png',
		delayRenderTimeoutInMilliseconds: 5000,
	});

	await testImage({
		blob,
		testId: 'video-tag',
	});
});

test('cannot render inside an svg tag', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{transform: 'rotate(45deg)'}}
				>
					<Video src={staticFile('video.mp4')} />
				</svg>
			</AbsoluteFill>
		);
	};

	try {
		await renderStillOnWeb({
			component: Component,
			durationInFrames: 100,
			fps: 30,
			width: 100,
			height: 100,
			frame: 20,
			inputProps: {},
			imageFormat: 'png',
			delayRenderTimeoutInMilliseconds: 5000,
		});
	} catch (error) {
		expect((error as Error).message).toMatch(
			'Canvas does not have .getContext() method available',
		);
	}
});
