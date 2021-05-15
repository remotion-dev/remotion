import React from 'react';
import {Video} from 'remotion';
import framer from '../resources/framer-music.mp4';

export const VideoSpeed: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flex: 1,
			}}
		>
			<Video src={framer} playbackRate={2} startFrom={20} />
		</div>
	);
};
