import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

test('preserves the original cancellation error and its causes', async () => {
	const decoderError = new DOMException(
		'Decoder allocation failed',
		'EncodingError',
	);
	const mediaError = new Error('Video decoding failed at 0.5s', {
		cause: decoderError,
	});
	const error = new Error('This should be the error message', {
		cause: mediaError,
	});
	const Component: React.FC = () => {
		const {delayRender, cancelRender} = useDelayRender();

		useState(() => delayRender('Fetching data...'));

		useEffect(() => {
			Promise.resolve().then(() => {
				try {
					cancelRender(error);
				} catch {
					// cancelRender throws, we catch it here
				}
			});
		}, [cancelRender]);

		return null;
	};

	const composition = {
		component: Component,
		id: 'cancel-render-test',
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 30,
	};

	await expect(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 20,
			inputProps: {},
		}),
	).rejects.toBe(error);

	await expect(
		renderMediaOnWeb({
			licenseKey: 'free-license',
			composition,
			inputProps: {},
			container: 'webm',
		}),
	).rejects.toBe(error);
});
