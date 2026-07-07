import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700'],
});

export const LowerThird: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Lower third"
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 24,
				width: 680,
				boxSizing: 'border-box',
				padding: 24,
				borderRadius: 24,
				fontFamily: 'Inter',
				backgroundColor: 'rgba(255, 255, 255, 0.94)',
				boxShadow: '0 6px 12px rgba(24, 24, 27, 0.2)',
				border: '1px solid rgba(24, 24, 27, 0.08)',
				opacity: interpolate(frame, [0, 18], [0, 1], {
					extrapolateRight: 'clamp',
				}),
				translate: interpolate(frame, [0, 24], ['32px 0px', '0px 0px'], {
					extrapolateRight: 'clamp',
					easing: Easing.spring({
						damping: 180,
						stiffness: 120,
					}),
				}),
				scale: interpolate(frame, [0, 22], [0.96, 1], {
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.33, 1, 0.68, 1),
				}),
				transformOrigin: 'left bottom',
			}}
		>
			<Interactive.Div
				name="Initials badge"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: 88,
					height: 88,
					borderRadius: 20,
					background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
					color: 'white',
					fontSize: 34,
					fontWeight: 600,
					lineHeight: 1,
					boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
				}}
			>
				AM
			</Interactive.Div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					minWidth: 0,
				}}
			>
				<Interactive.Div
					name="Name"
					style={{
						color: '#18181b',
						fontSize: 48,
						fontWeight: 700,
						lineHeight: 1,
					}}
				>
					Alex Morgan
				</Interactive.Div>
				<Interactive.Div
					name="Title"
					style={{
						color: '#52525b',
						fontSize: 26,
						fontWeight: 500,
						lineHeight: 1,
					}}
				>
					Creative Developer
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};
