import {AbsoluteFill, Img, staticFile} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('can display an image', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Img style={{height: '100%'}} src={staticFile('1.webp')} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
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
