import {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import {useDelayRender} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {testImage} from './utils';

test('should be able to use delayRender()', async () => {
	const Component: React.FC = () => {
		const {delayRender, continueRender} = useDelayRender();
		const [data, setData] = useState<boolean>(false);
		const [handle] = useState(() => delayRender());

		useEffect(() => {
			setTimeout(() => {
				continueRender(handle);
				// Replacing the last handle in the same task must not expose the
				// intermediate red frame to an event-driven readiness waiter.
				const nextHandle = delayRender('Loading the next piece of data');
				setTimeout(() => {
					flushSync(() => {
						setData(true);
					});
					continueRender(nextHandle);
				}, 50);
			}, 50);
		}, [continueRender, delayRender, handle]);

		return data ? (
			<svg viewBox="0 0 100 100" style={{backgroundColor: 'green'}} />
		) : (
			<svg viewBox="0 0 100 100" style={{backgroundColor: 'red'}} />
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'delay-render-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 100,
			},
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'delay-render'});
});
