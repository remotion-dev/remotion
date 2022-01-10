import React from 'react';
import {render} from 'react-dom';
import {LooseAnyComponent} from 'remotion';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';

const rootElement = document.getElementById('root');

const Car = () =>
	new Promise<{default: LooseAnyComponent<unknown>}>((resolve) => {
		setTimeout(
			() =>
				resolve({
					default: CarSlideshow as LooseAnyComponent<unknown>,
				}),
			3000
		);
	});

render(
	<div
		style={{
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
		}}
	>
		<App lazyComponent={Car} durationInFrames={500} />
		<App component={VideoautoplayDemo} durationInFrames={2700} />
	</div>,
	rootElement
);
