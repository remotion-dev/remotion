import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

test('should be able to cancel render', async () => {
	await expect(() => {
		const Component: React.FC = () => {
			const {delayRender, cancelRender} = useDelayRender();

			useState(() => delayRender('Fetching data...'));

			useEffect(() => {
				Promise.resolve().then(() => {
					try {
						cancelRender(new Error('This should be the error message'));
					} catch {
						// yo
					}
				});
			}, [cancelRender]);

			return null;
		};

		return renderStillOnWeb({
			component: Component,
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			frame: 20,
			inputProps: {},
		});
	}).rejects.toThrow('This should be the error message');
});
