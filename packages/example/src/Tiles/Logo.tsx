import {spring, useCurrentFrame, useVideoConfig} from '@remotion/core';
import React from 'react';

export const Logo = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame: Math.max(0, frame - 20),
		velocity: 2,
	};

	const scale = spring({
		...springConfig,
		velocity: 0,
		damping: 50,
		from: 0,
		to: 1,
	});
	return (
		<img
			style={{
				transform: `scale(${scale})`,
				height: 150,
			}}
			src="https://www.anysticker.app/logo-transparent.png"
		></img>
	);
};
