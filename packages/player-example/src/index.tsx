import React, {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';
import {Thumbnail} from '@remotion/player';
import {ThumbnailDemo} from './ThumbnailDemo';

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
	<div style={{}}>
		<React.StrictMode>
			<h2>Player</h2>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<App lazyComponent={Car} durationInFrames={500} />
				<App component={VideoautoplayDemo} durationInFrames={2700} />
			</div>
			<h2>Thumbnail</h2>
			<Thumbnail
				lazyComponent={Car}
				frameToDisplay={480}
				compositionHeight={200}
				compositionWidth={500}
				durationInFrames={5000}
				fps={30}
				style={{
					border: '4px solid red',
				}}
				inputProps={{
					title: 'Hi there',
				}}
			/>
			<ThumbnailDemo />
		</React.StrictMode>
	</div>
);
