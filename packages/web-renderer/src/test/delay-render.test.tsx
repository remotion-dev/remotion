import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('should be able to use delayRender()', async () => {
	const Component: React.FC = () => {
		const {delayRender, continueRender} = useDelayRender();
		const [data, setData] = useState<boolean>(false);
		const [handle] = useState(() => delayRender());

		useEffect(() => {
			setTimeout(() => {
				setData(true);
				continueRender(handle);
			}, 50);
		}, [continueRender, handle]);

		return data ? (
			<svg viewBox="0 0 100 100" style={{backgroundColor: 'green'}} />
		) : (
			<svg viewBox="0 0 100 100" style={{backgroundColor: 'red'}} />
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

	await testImage({blob, testId: 'delay-render'});
});
