import {
	interpolate,
	registerVideo,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const Up = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 200,
		mass: 2,
		stiffness: 60,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: true,
	};
	const progress = spring2({
		config: {...springConfig, mass: springConfig.mass * 1},
		frame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const translate = interpolate({
		input: progress,
		inputRange: [0, 1],
		outputRange: [1, 0],
	});

	const scale = interpolate({
		input: progress,
		inputRange: [0, 1],
		outputRange: [1.3, 1.3],
	});
	const rotateProgress = spring2({
		config: {...springConfig, mass: springConfig.mass * 1.3},
		frame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const frameToPick = Math.round(
		interpolate({
			input: rotateProgress,
			inputRange: [0.4, 1],
			outputRange: [1, 265],
			extrapolateLeft: 'clamp',
		})
	);
	const f = require('../assets/up/Rotato Frame ' + frameToPick + '.png')
		.default;
	console.log(frameToPick);
	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<img
				src={f}
				style={{
					transform: `translateY(${
						translate * videoConfig.height +
						(videoConfig.height - videoConfig.width) / 2
					}px) scale(${scale})`,
				}}
			></img>
		</div>
	);
};

registerVideo(Up, {
	width: 1080,
	height: 1920,
	durationInFrames: 2 * 30,
	fps: 30,
});
