import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const BigRotate = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const rotatoFrame = spring({
		fps: videoConfig.fps,
		config: {
			stiffness: 20,
			damping: 5,
			mass: 0.3,
			overshootClamping: false,
		},
		from: 1,
		to: 0,
		frame,
	});
	const scale = spring({
		fps: videoConfig.fps,
		config: {
			stiffness: 20,
			damping: 5,
			mass: 0.3,
			overshootClamping: false,
		},
		from: 0.5,
		to: 1,
		frame,
	});
	const frameInterpolated = Math.round(
		interpolate(rotatoFrame, [0, 1], [1, 250])
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
			/>
		</div>
	);
};
