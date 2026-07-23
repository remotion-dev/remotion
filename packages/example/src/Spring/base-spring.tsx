import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

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
					})})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const SpringWithDuration: React.FC = () => {
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
						durationInFrames: 90,
					})})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const RestThresholdSpringSquare: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#10131a',
			}}
		>
			<div
				style={{
					position: 'absolute',
					height: 240,
					width: 240,
					border: '3px solid rgba(255, 255, 255, 0.28)',
				}}
			/>
			<Interactive.Div
				style={{
					height: 240,
					width: 240,
					backgroundColor: '#0b84f3',
					boxShadow: '0 24px 70px rgba(11, 132, 243, 0.35)',
					translate: interpolate(
						frame,
						[0, 30, 60],
						['0px 1000px', '0px 0px', '1000px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'extend',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.03,
									overshootClamping: false,
								}),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.03,
									overshootClamping: false,
								}),
							],
						},
					),
				}}
			/>
		</AbsoluteFill>
	);
};
