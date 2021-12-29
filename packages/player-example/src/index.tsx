import {render} from 'react-dom';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';

const rootElement = document.getElementById('root');

render(
	<div
		style={{
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
		}}
	>
		<App comp={CarSlideshow} durationInFrames={500} />
		<App comp={VideoautoplayDemo} durationInFrames={2700} />
	</div>,
	rootElement
);
