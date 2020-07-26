import {deferRender, registerVideo} from '@remotion/core';
import React from 'react';
import {Video} from './Video';

deferRender();

export const Comp: React.FC = () => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Video style={{height: 800}} src="video.webm" />
		</div>
	);
};

registerVideo(Comp, {
	fps: 60,
	height: 1080,
	width: 1080,
	durationInFrames: 300,
});
