import {useCurrentFrame} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {testImage} from './utils';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
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
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'test-img'});
});

test('should be able to read frame number', async () => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100">
				<text x="50" y="50" textAnchor="middle" fill="blue">
					{frame}
				</text>
			</svg>
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'frame-number-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 20,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'frame-number'});
});
