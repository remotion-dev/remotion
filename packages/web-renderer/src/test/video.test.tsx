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

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'video-test',
			width: 1920 / 3,
			height: 1080 / 3,
			fps: 25,
			durationInFrames: 100,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 20,
		inputProps: {},
		imageFormat: 'png',
		delayRenderTimeoutInMilliseconds: 5000,
	});

	await testImage({
		blob,
		testId: 'video-tag',
		allowedMismatchedPixelRatio: 0.01,
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
			licenseKey: 'free-license',
			composition: {
				component: Component,
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 100,
				id: 'video-test',
				calculateMetadata: () => Promise.resolve({}),
			},
			frame: 20,
			inputProps: {},
			imageFormat: 'png',
			delayRenderTimeoutInMilliseconds: 5000,
		});
		throw new Error('Expected an error');
	} catch (error) {
		expect((error as Error).message).toMatch(
			'Canvas does not have .getContext() method available',
		);
	}
});
