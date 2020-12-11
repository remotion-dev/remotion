import {
	interpolate,
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const CoinAnimation = () => {
	const frame = useCurrentFrame();
	const {height, width, fps} = useVideoConfig();

	const progress = spring({
		from: 0,
		to: 1,
		frame,
		fps,
		config: {
			damping: 1,
			mass: 0.1,
			stiffness: 10,
			overshootClamping: false,
		},
	});
	const coinProgress = spring({
		from: 0,
		to: 1,
		frame,
		fps,
		config: {
			damping: 5,
			mass: 1,
			stiffness: 10,
			overshootClamping: false,
		},
	});

	const whichFrame = Math.round(
		interpolate(coinProgress, [0, 1], [1, 71], {
			extrapolateRight: 'clamp',
		})
	);

	const getFrame = (f: number) =>
		require(`./frames/0001.png${String(f).padStart(4, '0')}.png`).default;

	return (
		<div
			style={{
				backgroundColor: 'white',
				display: 'flex',
				alignItems: 'flex-end',
				flex: 1,
			}}
		>
			<img
				src={getFrame(whichFrame)}
				style={{
					height: height / 2,
					width,
					marginBottom: progress * 70,
					bottom: 0,
					opacity: progress,
				}}
			/>
		</div>
	);
};

registerVideo(CoinAnimation, {
	durationInFrames: 70,
	fps: 50,
	height: 200,
	width: 100,
});
