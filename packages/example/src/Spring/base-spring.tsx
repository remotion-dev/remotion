import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const BaseSpring: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					height: 200,
					width: 200,
					backgroundColor: 'red',
					borderRadius: 100,
					transform: `scale(${spring({
						frame,
						fps,
						config: {},
						duration: 90,
					})})`,
				}}
			/>
		</AbsoluteFill>
	);
};
