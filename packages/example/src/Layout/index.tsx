import {
	interpolate,
	registerVideo,
	spring2,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import {mix} from 'polished';
import React from 'react';
import {Orchestra} from './Orchestra';

export const Layout: React.FC = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring2({
		config: {
			damping: 10,
			mass: 1,
			stiffness: 100,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		frame,
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
	const color = interpolate({
		input: progress,
		outputRange: [0, 1],
		inputRange: [0.2, 1],
		extrapolateLeft: 'clamp',
	});
	const backgroundColor = mix(color, '#fff', '#000');
	return (
		<div
			style={{
				display: 'flex',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor,
			}}
		>
			<Orchestra
				phoneScale={1.7}
				layers={5}
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
