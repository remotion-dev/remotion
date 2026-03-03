import {AbsoluteFill, Img, staticFile} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {testImage} from './utils';

test('can display an image', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Img style={{height: '100%'}} src={staticFile('1.webp')} />
			</AbsoluteFill>
		);
	};

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'images-test',
			width: 550,
			height: 368,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'img-tag'});
});

test('should cancel render for a broken image', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Img src={staticFile('missing-image.png')} maxRetries={0} />
			</AbsoluteFill>
		);
	};

	await expect(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'missing-image-test',
				width: 100,
				height: 100,
				fps: 25,
				durationInFrames: 1,
				calculateMetadata: () => Promise.resolve({}),
			},
			frame: 0,
			inputProps: {},
			imageFormat: 'png',
			delayRenderTimeoutInMilliseconds: 5000,
		}),
	).rejects.toThrow(/Error loading image with src:/);
});
