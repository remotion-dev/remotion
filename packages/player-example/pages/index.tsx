import {Thumbnail} from '@remotion/player';
import React from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';
import {FontPicker} from '../src/FontPicker';
import {ThumbnailDemo} from '../src/ThumbnailDemo';
import {VideoautoplayDemo} from '../src/VideoAutoplay';
import {NativeBufferState} from '../src/BufferState';

function Index() {
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
				<App component={CarSlideshow} durationInFrames={100} />
			</div>
		</React.StrictMode>
	);
}

export default Index;
