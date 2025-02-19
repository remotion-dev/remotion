import {Thumbnail} from '@remotion/player';
import React from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';
import {FontPicker} from '../src/FontPicker';
import {ThumbnailDemo} from '../src/ThumbnailDemo';

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
				<App component={CarSlideshow} durationInFrames={500} />
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

export default Index;
