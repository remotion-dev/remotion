import React, {ComponentType} from 'react';
import {render} from 'react-dom';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';

const rootElement = document.getElementById('root');

const Car = () =>
	new Promise<{default: ComponentType<unknown>}>((resolve) => {
		setTimeout(
			() =>
				resolve({
					default: CarSlideshow as ComponentType<unknown>,
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
