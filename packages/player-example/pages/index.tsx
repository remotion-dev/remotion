import {Thumbnail} from '@remotion/player';
import React from 'react';
import CarSlideshow from '../src/CarSlideshow';

function Index() {
	return (
		<React.StrictMode>
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
		</React.StrictMode>
	);
}

export default Index;
