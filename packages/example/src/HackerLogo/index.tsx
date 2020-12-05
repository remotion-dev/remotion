import {registerVideo} from '@remotion/core';
import React from 'react';

export const HackerLogo = () => {
	return (
		<div
			style={{
				height: 1024,
				width: 1024,
				background: 'black',
				fontSize: 200,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: 'Roboto Condensed',
			}}
		>
			<span style={{color: 'white'}}>HACKER</span>
		</div>
	);
};

registerVideo(HackerLogo, {
	width: 1024,
	height: 1024,
	fps: 1,
	durationInFrames: 1,
});
