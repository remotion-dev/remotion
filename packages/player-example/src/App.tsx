import {Player, PlayerMethods} from '@remotion/player';
import {useRef, useState} from 'react';
import CarSlideshow from './CarSlideshow';
import CarSlideshowNew from './CarSlideshowNew';

export default function App() {
	const [title, setTitle] = useState('This is my title');

	const ref = useRef<PlayerMethods>(null);

	const ref2 = useRef<PlayerMethods>(null);

	return (
		<div>
			<Player
				ref={ref}
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
			<Player
				ref={ref2}
				width={768}
				height={432}
				fps={30}
				durationInFrames={500}
				component={CarSlideshowNew}
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
			<button type="button" onClick={() => ref.current?.play()}>
				Play
			</button>
			<button type="button" onClick={() => ref.current?.pause()}>
				Pause
			</button>
			<button type="button" onClick={() => ref2.current?.play()}>
				Play2
			</button>
			<button type="button" onClick={() => ref2.current?.pause()}>
				Pause2
			</button>
		</div>
	);
}
