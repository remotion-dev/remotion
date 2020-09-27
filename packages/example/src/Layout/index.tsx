import {
	interpolate,
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Orchestra} from './Orchestra';

export const Layout: React.FC = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring({
		damping: 10,
		mass: 0.5,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame,
		velocity: 2,
		from: 0,
		to: 1,
	});
	const yOffset = interpolate({
		input: progress,
		outputRange: [350, 180],
		inputRange: [0, 1],
	});
	const xOffset = interpolate({
		input: progress,
		outputRange: [800, 500],
		inputRange: [0, 1],
	});
	return (
		<div
			style={{
				display: 'flex',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#fff',
			}}
		>
			<Orchestra
				phoneScale={1.7}
				layers={4}
				xOffset={xOffset}
				yOffset={yOffset}
			/>
		</div>
	);
};

registerVideo(Layout, {
	width: 1080,
	height: 1080,
	durationInFrames: 3 * 30,
	fps: 30,
});
