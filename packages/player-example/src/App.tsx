import {Player, PlayerMethods} from '@remotion/player';
import {useRef, useState} from 'react';
import CarSlideshow from './CarSlideshow';

export default function App() {
	const [title, setTitle] = useState('Hello World');

	const ref = useRef<PlayerMethods>(null);

	return (
		<div>
			<Player
				ref={ref}
				width={500}
				height={432}
				fps={30}
				durationInFrames={500}
				component={CarSlideshow}
				controls
				props={{
					title: String(title),
				}}
			/>
			<input
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
			<button type="button" onClick={() => ref.current?.toggle()}>
				toggle
			</button>
			<button type="button" onClick={() => ref.current?.seekTo(50)}>
				seekTo 50
			</button>
			<button type="button" onClick={() => ref.current?.seekTo(10)}>
				seekTo 10
			</button>
		</div>
	);
}
