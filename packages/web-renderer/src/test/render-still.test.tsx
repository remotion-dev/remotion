import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

test('should render still on web', async () => {
	const blob = await renderStillOnWeb({
		Component: () => {
			return (
				<svg viewBox="0 0 100 100">
					<circle cx="50" cy="50" r="50" fill="red" />
				</svg>
			);
		},
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 30,
		frame: 0,
	});

	console.log(blob);
});
