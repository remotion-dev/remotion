import {loadVariableFont} from '@remotion/google-fonts/NotoSans';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const {axes, fontFamily} = loadVariableFont('normal', {
	subsets: ['latin'],
});

export const VariableGoogleFont: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const weight = Math.round(
		interpolate(
			frame,
			[0, (durationInFrames - 1) / 2, durationInFrames - 1],
			[axes.wght.min, axes.wght.max, axes.wght.min],
			{
				easing: Easing.inOut(Easing.ease),
			},
		),
	);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#f4f1e8',
				color: '#161616',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 150,
					fontWeight: weight,
					letterSpacing: -7,
					lineHeight: 1,
				}}
			>
				Variable
			</div>
			<div
				style={{
					fontFamily,
					fontSize: 28,
					fontWeight: 500,
					letterSpacing: 4,
					marginTop: 56,
				}}
			>
				FONT WEIGHT {weight}
			</div>
		</AbsoluteFill>
	);
};
