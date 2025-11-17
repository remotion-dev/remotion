import {interpolateColors, useCurrentFrame} from 'remotion';
import {test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';

test('should render media on web', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100" style={{width: 400, height: 400}}>
				<circle
					cx="50"
					cy="50"
					r="50"
					fill={interpolateColors(frame, [0, 4], ['red', 'blue'])}
				/>
			</svg>
		);
	};

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'render-media-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 5,
		},
		inputProps: {},
	});
});
