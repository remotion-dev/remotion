import {AbsoluteFill, Img} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

// The GitHub avatar redirect could hang before the browser reported its CORS
// failure. Serve a valid local image without CORS headers on a separate origin.
test('should throw readable error when image is blocked by CORS', async () => {
	const imageUrl = new URL('/1.jpg?cors-denied', window.location.href);
	const response = await fetch(imageUrl);
	const address = response.headers.get('X-Test-Local-Address');
	await response.arrayBuffer();
	expect(address).not.toBeNull();
	imageUrl.hostname =
		imageUrl.hostname === 'localhost'
			? address!.includes(':')
				? `[${address}]`
				: address!
			: 'localhost';
	expect(imageUrl.origin).not.toBe(window.location.origin);

	// A non-CORS image must decode: the fixture is neither missing nor corrupt.
	const control = new Image();
	control.src = imageUrl.href;
	await control.decode();
	expect(control.naturalWidth).toBeGreaterThan(0);

	const Component: React.FC = () => (
		<AbsoluteFill>
			<Img src={imageUrl.href} />
		</AbsoluteFill>
	);

	await expect(
		renderStillOnWeb({
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
		}),
	).rejects.toThrow(
		/CORS restrictions|broken state|Could not draw image|Error loading image with src/,
	);
});
