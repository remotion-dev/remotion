import {
	interpolate,
	spring,
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
		overshootClamping: true,
	};
	const upFrame = Math.max(0, frame - 24);
	const progress = spring({
		config: {...springConfig, mass: springConfig.mass * 1},
		frame: upFrame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const translate = interpolate(progress, [0, 1], [1, -0.08]);
	const textUpOffset = interpolate(progress, [0, 1], [0, -videoConfig.height]);

	const scale = interpolate(progress, [0, 1], [0.5, 1.3]);
	const rotateProgress = spring({
		config: {...springConfig, mass: springConfig.mass * 1.3},
		frame: upFrame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const frameToPick = Math.floor(
		interpolate(rotateProgress, [0.4, 1], [1, 265], {
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
				<Title line1="hi" line2="there" />
			</div>
			<img
				src={f}
				style={{
					transform: `translateY(${
						translate * videoConfig.height +
						(videoConfig.height - videoConfig.width) / 2
					}px) scale(${scale})`,
				}}
			/>
		</div>
	);
};
