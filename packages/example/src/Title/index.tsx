import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const Title = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame,
	};

	const firstWord = spring({
		...springConfig,
		from: 0,
		to: 1,
	});
	const secondWord = spring({
		...springConfig,
		frame: Math.max(0, frame - 5),
		from: 0,
		to: 1,
	});
	const thirdWord = spring({
		...springConfig,
		frame: Math.max(0, frame - 12),
		from: 0,
		to: 1,
	});
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<div
				style={{
					fontSize: 110,
					fontWeight: 'bold',
					fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
				}}
			>
				<span
					style={{
						display: 'inline-block',
						transform: `scale(${firstWord})`,
						marginRight: 25,
					}}
				>
					More
				</span>
				<span
					style={{transform: `scale(${secondWord})`, display: 'inline-block'}}
				>
					{' '}
					sticker{' '}
				</span>
				<span
					style={{
						transform: `scale(${thirdWord})`,

						display: 'inline-block',
						marginLeft: 25,
					}}
				>
					types
				</span>
			</div>
		</div>
	);
};

registerVideo(Title, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 30,
});
