import {registerVideo, useCurrentFrame} from '@remotion/core';
import React from 'react';

export const TextStickerShowCase = () => {
	const frames = new Array(50).fill(true).map((t, i) => {
		return require('../assets/Rotato Frame ' + (i + 1) * 2 + '.png').default;
	});
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<img src={frames[Math.min(49, frame)]} style={{width: 1000}}></img>
		</div>
	);
};

registerVideo(TextStickerShowCase, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 3 * 30,
});
