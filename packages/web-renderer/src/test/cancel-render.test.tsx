import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

test('should be able to cancel render', async () => {
	const Component: React.FC = () => {
		const {delayRender, cancelRender} = useDelayRender();

		useState(() => delayRender('Fetching data...'));

		useEffect(() => {
			Promise.resolve().then(() => {
				try {
					cancelRender(new Error('This should be the error message'));
				} catch {
					// cancelRender throws, we catch it here
				}
			});
		}, [cancelRender]);

		return null;
	};

	await expect(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'cancel-render-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 20,
			inputProps: {},
			imageFormat: 'png',
		}),
	).rejects.toThrow(/This should be the error message/);
});
