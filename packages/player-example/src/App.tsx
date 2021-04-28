import {Player, PlayerMethods} from '@remotion/player';
import {useRef, useState} from 'react';
import CarSlideshow from './CarSlideshow';

export default function App() {
	const [title, setTitle] = useState(0);

	const ref = useRef<PlayerMethods>(null);

	return (
		<div>
			<Player
				ref={ref}
				width={768}
				height={432}
				fps={30}
				durationInFrames={500}
				component={CarSlideshow}
				controls={true}
				style={{
					position: 'relative',
					overflow: 'hidden',
				}}
				props={{
					title,
				}}
			/>
			<input
				type="number"
				value={title}
				onChange={(e) => {
					setTitle(Number(e.target.value) as number);
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
			<button type="button" onClick={() => ref.current?.seekTo(title)}>
				seekTo
			</button>
		</div>
	);
}
