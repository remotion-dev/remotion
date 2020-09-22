import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Single} from './Single';

export const Devices = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig = {
		damping: 10,
		mass: 1,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame,
	};

	const bigScale = spring({
		...springConfig,
		from: 1.1,
		to: 0.9,
	});
	const smallScale = spring({
		...springConfig,
		from: 0.5,
		to: 0.6,
	});
	const offset = spring({
		...springConfig,
		from: 100,
		to: 0,
	});
	const awesome = require('../assets/awesome.png').default;
	const face = require('../assets/face.png').default;
	const packs = require('../assets/packs.png').default;

	return (
		<div
			style={{
				height: videoConfig.height,
				width: videoConfig.width,
				backgroundColor: 'white',
			}}
		>
			<Single
				source={face}
				style={{transform: `scale(${smallScale})`, marginLeft: -300 - offset}}
			></Single>
			<Single
				source={packs}
				style={{transform: `scale(${smallScale})`, marginLeft: 300 + offset}}
			></Single>
			<Single
				source={awesome}
				style={{transform: `scale(${bigScale})`}}
			></Single>
		</div>
	);
};

registerVideo(Devices, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 3 * 30,
});
