import {
	interpolate,
	registerVideo,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Title} from '../Title';

export const Up = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 200,
		mass: 0.4,
		stiffness: 60,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: true,
	};
	const upFrame = Math.max(0, frame - 24);
	const progress = spring2({
		config: {...springConfig, mass: springConfig.mass * 1},
		frame: upFrame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const translate = interpolate({
		input: progress,
		inputRange: [0, 1],
		outputRange: [1, -0.08],
	});
	const textUpOffset = interpolate({
		input: progress,
		inputRange: [0, 1],
		outputRange: [0, -videoConfig.height],
	});

	const scale = interpolate({
		input: progress,
		inputRange: [0, 1],
		outputRange: [0.5, 1.3],
	});
	const rotateProgress = spring2({
		config: {...springConfig, mass: springConfig.mass * 1.3},
		frame: upFrame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const frameToPick = Math.floor(
		interpolate({
			input: rotateProgress,
			inputRange: [0.4, 1],
			outputRange: [1, 265],
			extrapolateLeft: 'clamp',
		})
	);
	const f = require('../assets/up/Rotato Frame ' + frameToPick + '.png')
		.default;
	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					display: 'flex',
					top: textUpOffset,
					left: 0,
					width: videoConfig.width,
					height: videoConfig.height,
				}}
			>
				<Title></Title>
			</div>
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
	height: 1080,
	durationInFrames: 4 * 30,
	fps: 30,
});
