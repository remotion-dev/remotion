import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

test('should be able to cancel render', async (t) => {
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

	try {
		await renderStillOnWeb({
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
		});
	} catch (error) {
		if (
			t.task.file.projectName === 'firefox' ||
			t.task.file.projectName === 'webkit'
		) {
			expect(error).not.toMatch(/This should be the error message/);
		} else {
			expect(error).toMatch(/This should be the error message/);
		}
	}
});
