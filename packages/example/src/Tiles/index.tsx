import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Tile} from './Tile';

export const Tiles = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const springConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame,
		velocity: 2,
	};

	const scale = spring({
		...springConfig,
		velocity: 0,
		damping: 50,
		from: 1,
		to: 2.5,
	});
	const outerScale = spring({
		...springConfig,
		velocity: 0,
		from: 1,
		frame: Math.max(0, frame - 20),
		to: 3,
	});
	const rotate = spring({
		...springConfig,
		velocity: 0,
		frame: Math.max(0, frame - 20),
		from: -100,
		to: 0,
	});
	return (
		<div
			style={{
				backgroundColor:
					'linear-gradient(-90deg, rgb(88, 81, 219), rgb(64, 93, 230))',
				flex: 1,
			}}
		>
			<div
				style={{
					transform: `scale(${outerScale})`,
					width: videoConfig.width,
					height: videoConfig.height,
				}}
			>
				<div
					style={{
						transform: `scale(${scale}) rotate(${rotate}deg)`,
						width: videoConfig.width,
						height: videoConfig.height,
					}}
				>
					{new Array(40)
						.fill(true)
						.map((_, i) => i)
						.map((i) => {
							return <Tile key={i} index={i} />;
						})}
				</div>
			</div>
		</div>
	);
};

registerVideo(Tiles, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 3 * 30,
});
