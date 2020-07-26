import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from '@remotion/core';
import React from 'react';

export const Comp: React.FC = () => {
	// TODO: Tell user to import inside component
	const iphone = require('./iphone.png').default;
	const video = require('./stickerifyanything.webm').default;
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const scale = spring({
		damping: 10,
		mass: 0.1,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: videoConfig.fps,
		frame,
		velocity: 0,
		from: 0.3,
		to: 1,
	});

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
					transform: `scale(${scale}, ${scale})`,
				}}
			>
				<img
					src={iphone}
					style={{
						position: 'absolute',
						width: 1405 / 2.71,
						height: 2796 / 2.71,
					}}
				/>
				<Video style={{height: 900}} src={video} />
			</div>
		</div>
	);
};

registerVideo(Comp, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 17 * 30,
});
