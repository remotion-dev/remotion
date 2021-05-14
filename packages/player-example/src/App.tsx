import {Player, PlayerRef} from '@remotion/player';
import {useEffect, useRef, useState} from 'react';
import CarSlideshow from './CarSlideshow';

export default function App() {
	const [title, setTitle] = useState('Hello World');
	const [loop, setLoop] = useState(false);
	const [logs, setLogs] = useState<string[]>(() => []);

	const ref = useRef<PlayerRef>(null);

	useEffect(() => {
		ref.current?.addEventListener('play', () => {
			setLogs((l) => [...l, 'playing ' + Date.now()]);
		});
		ref.current?.addEventListener('pause', () => {
			setLogs((l) => [...l, 'pausing ' + Date.now()]);
		});
		ref.current?.addEventListener('seeked', (e) => {
			setLogs((l) => [...l, 'seeked to ' + e.detail.frame + ' ' + Date.now()]);
		});
		ref.current?.addEventListener('ended', (e) => {
			setLogs((l) => [...l, 'ended ' + Date.now()]);
		});
		ref.current?.addEventListener('error', (e) => {
			setLogs((l) => [...l, 'error ' + Date.now()]);
		});
	}, []);

	return (
		<div>
			<Player
				ref={ref}
				compositionWidth={500}
				compositionHeight={432}
				fps={30}
				durationInFrames={500}
				component={CarSlideshow}
				controls
				loop={loop}
				inputProps={{
					title: String(title),
				}}
			/>
			<input
				value={title}
				onChange={(e) => {
					setTitle(e.target.value);
				}}
			/>
			<br />
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
			<button type="button" onClick={() => setLoop((l) => !l)}>
				loop = {String(loop)}
			</button>
			<button
				type="button"
				onClick={() =>
					setLogs((l) => [
						...l,
						`currentFrame = ${ref.current?.getCurrentFrame()}`,
					])
				}
			>
				log currentFrame
			</button>
			<br />
			<br />
			{logs
				.slice(0)
				.reverse()
				.slice(0, 10)
				.reverse()
				.map((l) => {
					return <div key={l}>{l}</div>;
				})}
		</div>
	);
}
