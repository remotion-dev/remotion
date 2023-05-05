import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const ManyAudio: React.FC = () => {
	return (
		<AbsoluteFill>
			{new Array(32).fill(true).map(() => {
				return <Audio src={staticFile('music.mp3')} />;
			})}
		</AbsoluteFill>
	);
};
