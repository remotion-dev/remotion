import {Thumbnail} from '@remotion/player';
import React, {ComponentType} from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';
import {FontPicker} from '../src/FontPicker';
import {ThumbnailDemo} from '../src/ThumbnailDemo';
import {VideoautoplayDemo} from '../src/VideoAutoplay';

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

export default function () {
	return (
		<React.StrictMode>
			<FontPicker />
			<h2>Player</h2>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<App component={CarSlideshow} durationInFrames={500} />
				<App component={VideoautoplayDemo} durationInFrames={2700} />
			</div>
			<h2>Thumbnail</h2>
			<Thumbnail
				component={CarSlideshow}
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
					bgColor: 'black',
					color: 'white',
				}}
			/>
			<ThumbnailDemo />
		</React.StrictMode>
	);
}
