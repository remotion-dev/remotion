import React from 'react';
import {Html5Audio, OffthreadVideo, Sequence, staticFile} from 'remotion';

const Amplify: React.FC = () => {
	const [volume1, setVolume1] = React.useState(1);
	const [volume2, setVolume2] = React.useState(1);
	const [volume3, setVolume3] = React.useState(1);

	return (
		<>
			<input
				type="range"
				min={0}
				max={10}
				step={0.1}
				value={volume1}
				onChange={(e) => setVolume1(Number(e.target.value))}
				style={{width: 200}}
			/>
			<button onClick={() => setVolume1(2)}>set to 2</button>
			<input
				type="range"
				min={0}
				max={10}
				step={0.1}
				value={volume2}
				onChange={(e) => setVolume2(Number(e.target.value))}
				style={{width: 200}}
			/>
			<button onClick={() => setVolume2(0.5)}>set to 0.5</button>
			<input
				type="range"
				min={0}
				max={10}
				step={0.1}
				value={volume3}
				onChange={(e) => setVolume3(Number(e.target.value))}
			/>
			<Html5Audio src={staticFile('music.mp3')} volume={volume1} />
			<Html5Audio src={staticFile('sounds/9.wav')} volume={volume2} />
			<Sequence durationInFrames={90}>
				<OffthreadVideo
					src={staticFile('bigbuckbunny.mp4')}
					volume={volume3}
					playbackRate={1}
					style={{
						height: 80,
					}}
				/>
			</Sequence>
			<Sequence
				from={90}
				premountFor={100}
				style={{
					top: 120,
				}}
			>
				<OffthreadVideo
					src={staticFile('vid1.mp4')}
					volume={volume3}
					playbackRate={2}
					pauseWhenBuffering
					style={{
						height: 80,
					}}
				/>
			</Sequence>
		</>
	);
};

export default Amplify;
