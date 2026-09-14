import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BLUE} from './NumberedChapter';

type LowerThirdProps = {
	readonly name: string;
	readonly title: string;
	readonly durationInFrames?: number;
};

export const LowerThird: React.FC<LowerThirdProps> = ({
	name,
	title,
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
				padding: 70,
				justifyContent: 'flex-end',
				alignItems: 'flex-start',
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					fontFamily: 'GT Planar',
					fontFeatureSettings: "'ss03' 1",
					padding: '24px 44px',
					borderRadius: 18,
					boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
					transform: `translateY(${interpolate(progress, [0, 1], [400, 0])}px) rotateZ(${interpolate(progress, [0, 1], [-Math.PI * 0.03, 0])}rad)`,
				}}
			>
				<div style={{fontSize: 50, fontWeight: 700, color: '#111'}}>{name}</div>
				<div
					style={{fontSize: 36, fontWeight: 400, marginTop: -12, color: BLUE}}
				>
					{title}
				</div>
			</div>
		</AbsoluteFill>
	);
};
