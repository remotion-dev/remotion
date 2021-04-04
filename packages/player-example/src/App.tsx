import {Player} from '@remotion/player';
import CarSlideshow from './CarSlideshow';

export default function App() {
	return (
		<Player
			width={768}
			height={432}
			fps={30}
			durationInFrames={500}
			component={CarSlideshow}
		/>
	);
}
