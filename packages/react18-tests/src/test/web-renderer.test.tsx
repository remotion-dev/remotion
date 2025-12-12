import {renderStillOnWeb} from '@remotion/web-renderer';
import {test} from 'vitest';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

	await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'render-still-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	// It worked!
});
