import {AbsoluteFill, Img, staticFile} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('can extract a video frame', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Img style={{height: '100%'}} src={staticFile('1.webp')} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 1,
		fps: 25,
		width: 550,
		height: 368,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'img-tag'});
});
