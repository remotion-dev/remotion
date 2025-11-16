import {interpolateColors, useCurrentFrame} from 'remotion';
import {test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';

test('should render media on web', async (t) => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100" style={{width: 400, height: 400}}>
				<circle
					cx="50"
					cy="50"
					r="50"
					fill={interpolateColors(frame, [0, 100], ['red', 'blue'])}
				/>
			</svg>
		);
	};

	await renderMediaOnWeb({
		composition: {
			component: Component,
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 100,
		},
		onProgress: (progress) => {
			console.log('Progress:', progress.renderedFrames, progress.encodedFrames);
		},
		inputProps: {},
		hardwareAcceleration:
			t.task.file.projectName === 'webkit'
				? 'prefer-software'
				: 'no-preference',
	});
	// Debug safari
	// eslint-disable-next-line no-console
	console.log('Done!');
	/*
	const url = URL.createObjectURL(
		new File([file], 'test.mp4', {
			type: 'video/mp4',
		}),
	);
	const videoTag = document.createElement('video');
	videoTag.src = url;
	videoTag.controls = true;
	videoTag.width = 400;
	videoTag.height = 400;
	document.body.appendChild(videoTag);
*/
});
