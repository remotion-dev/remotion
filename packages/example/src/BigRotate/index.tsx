import {registerVideo, useCurrentFrame} from '@remotion/core';
import React from 'react';

export const BigRotate = () => {
	const frame = useCurrentFrame();
	const src = require('./assets/Rotato Frame ' + (frame + 1) + '.png').default;
	return (
		<div
			style={{
				background: 'white',
				flex: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<img src={src}></img>
		</div>
	);
};

registerVideo(BigRotate, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 3 * 30,
});
