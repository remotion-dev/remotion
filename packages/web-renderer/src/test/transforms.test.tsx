import {AbsoluteFill} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('should be able to deal with a simple transform directly on the element', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{transform: 'rotate(45deg)'}}
				>
					<polygon points="50,10 90,90 10,90" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
	});

	await testImage({blob, testId: 'nested-transforms'});
});
