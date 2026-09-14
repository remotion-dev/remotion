import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const PADDING = 70;

type UpperReferenceProps = {
	readonly text: string;
	readonly fontSize?: number;
	readonly maxWidth?: number;
	readonly durationInFrames?: number;
};

export const UpperReference: React.FC<UpperReferenceProps> = ({
	text,
	fontSize = 70,
	maxWidth,
	durationInFrames,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const entry = spring({
		fps,
		frame,
		config: {damping: 200},
	});

	const exit = durationInFrames
		? spring({
				fps,
				frame: frame - durationInFrames + 15,
				config: {damping: 200},
			})
		: 0;

	const progress = entry - exit;

	return (
		<AbsoluteFill
			style={{
				padding: PADDING,
				justifyContent: 'flex-start',
				alignItems: 'flex-start',
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					fontFamily: 'GT Planar',
					padding: '24px 44px',
					fontSize,
					top: PADDING,
					borderRadius: 18,
					boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
					fontWeight: 'bold',
					maxWidth,
					transform: `translateY(${-interpolate(progress, [0, 1], [400, 0])}px) rotateZ(${interpolate(progress, [0, 1], [Math.PI * 0.05, 0])}rad)`,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};
