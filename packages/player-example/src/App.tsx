import {usePlayer} from '@remotion/player';
import {useState} from 'react';
import CarSlideshow from './CarSlideshow';

export default function App() {
	const [title, setTitle] = useState('This is my title');
	const {Player} = usePlayer();
	return (
		<div>
			<Player
				width={768}
				height={432}
				fps={30}
				durationInFrames={500}
				component={CarSlideshow}
				controls
				props={{
					title,
				}}
			/>
			<input
				type="text"
				value={title}
				onChange={(e) => {
					setTitle(e.target.value);
				}}
			/>
		</div>
	);
}
