import React from 'react';
import {spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';

const size = 200;

export const Tile: React.FC<{
	readonly index: number;
}> = ({index}) => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig: SpringConfig = {
		damping: 100,
		mass: 0.5,
		stiffness: 10,
		overshootClamping: true,
	};
	const scale = spring({
		config: springConfig,
		fps: videoConfig.fps,
		frame,
		from: 0,
		to: 1,
	});
	const rotate = spring({
		config: springConfig,
		fps: videoConfig.fps,
		from: 0,
		frame,
		to: 1,
	});
	return (
		<div
			style={{
				height: size,
				width: size,
				position: 'absolute',
				zIndex: 1000 - index,
				left: videoConfig.width / 2 - size / 2,
				top: videoConfig.height / 2 - size / 2,
				borderRadius: 20,
				background: 'radial-gradient(ellipse at bottom, white, #eee)',
				boxShadow: '0 0 3px rgba(0, 0, 0, 0.1)',
				transform: ` rotateZ(${index * 8 * rotate}deg) translateY(${
					index * 15
				}px) scale(${scale}`,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		/>
	);
};
