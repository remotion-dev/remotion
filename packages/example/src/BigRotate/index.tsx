import {
	interpolate,
	registerVideo,
	spring2,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const BigRotate = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const rotatoFrame = spring2({
		fps: videoConfig.fps,
		config: {
			stiffness: 20,
			damping: 5,
			mass: 0.3,
			overshootClamping: false,
			restDisplacementThreshold: 0.01,
			restSpeedThreshold: 0.01,
		},
		from: 1,
		to: 0,
		frame,
	});
	const scale = spring2({
		fps: videoConfig.fps,
		config: {
			stiffness: 20,
			damping: 5,
			mass: 0.3,
			overshootClamping: false,
			restDisplacementThreshold: 0.01,
			restSpeedThreshold: 0.01,
		},
		from: 0.5,
		to: 1,
		frame,
	});
	const frameInterpolated = Math.round(
		interpolate({
			input: rotatoFrame,
			inputRange: [0, 1],
			outputRange: [1, 250],
		})
	);
	const src = require('./assets/Rotato Frame ' +
		(frameInterpolated + 1) +
		'.png').default;
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<img
				src={src}
				style={{
					transform: `scale(${scale})`,
				}}
			></img>
		</div>
	);
};

registerVideo(BigRotate, {
	width: 1080,
	height: 1080,
	fps: 60,
	durationInFrames: 3 * 30,
});
