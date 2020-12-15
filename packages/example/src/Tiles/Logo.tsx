import React from 'react';
import {spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';

export const Logo = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 10,
		overshootClamping: true,
	};

	const scale = spring({
		fps: videoConfig.fps,
		frame: Math.max(0, frame - 20),
		config: springConfig,
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
		/>
	);
};
