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
	//const iphone = require('./iphone.png').default;
	const iphone = require('./huawei.png').default;
	const video = require('./record-20200910-191938.webm').default;
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const scale = spring({
		config: {
			damping: 10,
			mass: 0.1,
			stiffness: 10,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: true,
		},
		from: 0.3,
		to: 1,
		fps: videoConfig.fps,
		frame,
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
				<div
					style={{
						height: 1000,
						width: 100,
						backgroundColor: 'white',
						position: 'absolute',
						marginLeft: -520,
					}}
				/>
				<div
					style={{
						height: 1000,
						width: 100,
						backgroundColor: 'white',
						position: 'absolute',
						marginLeft: 520,
					}}
				/>
				<img
					src={iphone}
					style={{
						position: 'absolute',
						//width: 1405 / 1.5,
						//height: 2796 / 1.5,
						width: 637 * 0.7,
						height: 1379 * 0.7,
					}}
				/>
				<Video
					//style={{height: 1620}}
					style={{height: 920, marginTop: -10, borderRadius: 20}}
					src={video}
				/>
			</div>
		</div>
	);
};

registerVideo(Comp, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 30 * 30,
});
