import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['600', '700'],
});

export const CornerChannelBug: React.FC = () => {
	const frame = useCurrentFrame();

	const enter = interpolate(frame, [0, 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	const tilt = interpolate(frame, [0, 90, 180], [8, -4, 8], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.sin),
	});

	const livePulse = interpolate(frame % 45, [0, 22, 45], [1, 0.45, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 12,
				boxSizing: 'border-box',
				padding: '10px 16px',
				borderRadius: 999,
				fontFamily: 'Inter',
				backgroundColor: 'rgba(15, 23, 42, 0.86)',
				border: '1px solid rgba(255, 255, 255, 0.14)',
				boxShadow: '0 10px 30px rgba(15, 23, 42, 0.35)',
				color: '#f8fafc',
				opacity: enter,
				transform: `perspective(600px) rotateY(${tilt}deg) translateY(${
					(1 - enter) * 12
				}px)`,
				transformOrigin: 'right top',
				backdropFilter: 'blur(10px)',
			}}
		>
			<Interactive.Div
				name="Live dot"
				style={{
					width: 10,
					height: 10,
					borderRadius: 999,
					backgroundColor: '#ef4444',
					boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.18)',
					opacity: livePulse,
					flexShrink: 0,
				}}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					minWidth: 0,
				}}
			>
				<Interactive.Div
					name="Label"
					style={{
						fontSize: 18,
						fontWeight: 700,
						letterSpacing: '0.08em',
						lineHeight: 1.1,
						textTransform: 'uppercase',
					}}
				>
					Remotion
				</Interactive.Div>
				<Interactive.Div
					name="Secondary label"
					style={{
						fontSize: 13,
						fontWeight: 600,
						letterSpacing: '0.14em',
						lineHeight: 1.1,
						color: '#94a3b8',
						textTransform: 'uppercase',
					}}
				>
					Live
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};
