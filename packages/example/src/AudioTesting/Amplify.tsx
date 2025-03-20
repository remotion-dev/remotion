import React from 'react';
import {Audio, staticFile} from 'remotion';

const Amplify: React.FC = () => {
	const [volume, setVolume] = React.useState(1);

	return (
		<>
			<input
				type="range"
				min={0.1}
				max={10}
				step={0.1}
				value={volume}
				onChange={(e) => setVolume(Number(e.target.value))}
				style={{width: 200}}
			/>
			<button onClick={() => setVolume(2)}>set to 2</button>
			<Audio
				src={staticFile('music.mp3')}
				// eslint-disable-next-line @remotion/volume-callback
				volume={volume}
			/>
		</>
	);
};

export default Amplify;
