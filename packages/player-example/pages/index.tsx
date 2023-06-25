import {Thumbnail} from '@remotion/player';
import React, {ComponentType} from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';

export default function () {
	return <App component={CarSlideshow} durationInFrames={500} />;
}
