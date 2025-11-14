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

test('should be able to deal with a simple transform on the parent', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill style={{transform: 'rotate(45deg)'}}>
				<svg viewBox="0 0 100 100" width="100" height="100">
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

test('should be able to deal with a transform-origin', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}
			>
				<svg viewBox="0 0 100 100" width="100" height="100">
					<rect x="0" y="0" width="50" height="50" fill="orange" />
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

	await testImage({blob, testId: 'transform-origin'});
});
