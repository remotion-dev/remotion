import {AbsoluteFill, Img} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

// Note: The behavior of tainted images varies by browser:
// - Chromium/Firefox: Image fails to load when crossOrigin="anonymous" is set
//   and server doesn't support CORS → "broken state" error
// - WebKit: Image may load as tainted but still render in some cases
// This test verifies we get a readable error message in either case.
test('should throw readable error for tainted or broken image', async (t) => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<Img src="https://github.com/JonnyBurger.png" />
			</AbsoluteFill>
		);
	};

	try {
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'tainted-image-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 1,
			},
			frame: 0,
			inputProps: {},
			imageFormat: 'png',
		});
		// WebKit may not throw - that's okay for this test
		if (t.task.file.projectName === 'webkit') {
			return;
		}

		throw new Error('Expected render to fail');
	} catch (err) {
		if (!(err instanceof Error)) {
			throw err;
		}

		// Should get either a CORS error or a broken state error with a readable message
		const hasReadableError =
			err.message.includes('CORS restrictions') ||
			err.message.includes('broken state') ||
			err.message.includes('Could not draw image');
		expect(hasReadableError).toBe(true);
	}
});

test('should render nothing when errorBehavior="ignore" for tainted image', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill style={{backgroundColor: 'red'}}>
				<Img src="https://github.com/JonnyBurger.png" errorBehavior="ignore" />
			</AbsoluteFill>
		);
	};

	// Should not throw, should render just the red background
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'ignore-error-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 1,
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'tainted-image-ignored'});
});
