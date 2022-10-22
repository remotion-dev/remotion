import React, {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';
import {Thumbnail} from "@remotion/player";
import {ThumbnailDemo} from "./ThumbnailDemo";

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

createRoot(rootElement as HTMLElement).render(
	<div
		style={{
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
		}}
	>
		<React.StrictMode>
			<App lazyComponent={Car} durationInFrames={500} />
			<App component={VideoautoplayDemo} durationInFrames={2700} />
			<ThumbnailDemo/>
		</React.StrictMode>
	</div>
);
