import {AbsoluteFill, Img} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

// Note: The behavior varies by browser when loading an image that redirects
// without CORS headers (like https://github.com/JonnyBurger.png):
// - Chromium/Firefox: Image fails to load when crossOrigin="anonymous" is set
//   and the redirect response doesn't have CORS headers → "broken state" error
// - WebKit: May handle the redirect differently and succeed in some cases
// This test verifies we get a readable error message when an image fails to load,
// whether due to CORS restrictions or other broken-state load failures.
test('should throw readable error when image fails to load or is blocked by CORS', async (t) => {
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
