import {
	registerVideo,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Single} from './Single';

export const Devices = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig: SpringConfig = {
		damping: 100,
		mass: 2,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: false,
	};

	const bigScale = spring2({
		config: springConfig,
		from: 1.1,
		fps: videoConfig.fps,
		frame,
		to: 0.9,
	});
	const smallScale = spring2({
		config: springConfig,
		from: 0.5,
		to: 0.6,
		frame,
		fps: videoConfig.fps,
	});
	const offset = spring2({
		config: springConfig,
		from: 100,
		to: 0,
		fps: videoConfig.fps,
		frame,
	});
	const awesome = require('../assets/awesome.png').default;
	const face = require('../assets/face.png').default;
	const home = require('../assets/home.png').default;

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
			/>
			<Single
				source={home}
				style={{transform: `scale(${smallScale})`, marginLeft: 300 + offset}}
			/>
			<Single source={awesome} style={{transform: `scale(${bigScale})`}} />
		</div>
	);
};

registerVideo(Devices, {
	fps: 30,
	height: 1920,
	width: 1080,
	durationInFrames: 3 * 30,
});
