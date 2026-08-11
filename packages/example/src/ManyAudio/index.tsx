import React from 'react';
import {AbsoluteFill, Html5Audio} from 'remotion';

export const ManyAudio: React.FC = () => {
	return (
		<AbsoluteFill>
			{new Array(32).fill(true).map(() => {
				return <Html5Audio src="https://remotion.media/music.mp3" />;
			})}
		</AbsoluteFill>
	);
};
