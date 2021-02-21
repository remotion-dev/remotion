import React from 'react';
import {Audio, Sequence} from 'remotion';
import sound from './sound.mp3';

const Sound: React.FC = () => {
	return (
		<Sequence from={20} durationInFrames={260}>
			<Audio src={sound} />
		</Sequence>
	);
};

export default Sound;
