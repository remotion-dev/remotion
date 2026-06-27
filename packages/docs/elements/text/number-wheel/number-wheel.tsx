import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const width = 1920;
export const height = 1080;
export const fps = 30;
export const durationInFrames = 120;

const FROM = 0;
const TO = 24813;

export const NumberWheel: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames: total} = useVideoConfig();

	const progress = interpolate(frame, [0, total * 0.8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});

	const current = Math.round(FROM + progress * (TO - FROM));

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'Inter, system-ui, sans-serif'
			}}
		>
			<div
				style={{
					fontSize: 220,
					fontWeight: 800,
					color: '#171717',
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{current.toLocaleString('en-US')}
			</div>
		</AbsoluteFill>
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="NumberWheel"
			component={NumberWheel}
			durationInFrames={durationInFrames}
			fps={fps}
			height={height}
			width={width}
		/>
	);
};
