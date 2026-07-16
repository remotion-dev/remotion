import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

export const LiveLocationStrap: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				width: 760,
				height: 156,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 16,
				padding: '24px 28px',
				border: '1px solid rgba(255, 255, 255, 0.18)',
				borderRadius: 14,
				backgroundColor: 'rgba(15, 23, 42, 0.94)',
				boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
				fontFamily: 'Arial, Helvetica, sans-serif',
				opacity: interpolate(frame, [0, 14], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				translate: interpolate(frame, [0, 20], ['-24px 0px', '0px 0px'], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					minWidth: 0,
				}}
			>
				<Interactive.Div
					name="Status label"
					dir="auto"
					style={{
						flexShrink: 0,
						maxWidth: 220,
						overflow: 'hidden',
						padding: '9px 12px',
						borderRadius: 7,
						backgroundColor: '#dc2626',
						color: 'white',
						fontSize: 20,
						fontWeight: 700,
						letterSpacing: 1.2,
						lineHeight: 1,
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					LIVE
				</Interactive.Div>
				<Interactive.Div
					name="Location"
					dir="auto"
					style={{
						minWidth: 0,
						overflow: 'hidden',
						color: 'white',
						fontSize: 36,
						fontWeight: 700,
						letterSpacing: -0.5,
						lineHeight: 1.05,
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					Berlin
				</Interactive.Div>
			</div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					minWidth: 0,
					overflow: 'hidden',
					color: '#cbd5e1',
					fontSize: 21,
					fontWeight: 500,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				<Interactive.Div
					name="Date"
					dir="auto"
					style={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					June 22
				</Interactive.Div>
				<span aria-hidden style={{color: '#94a3b8'}}>
					·
				</span>
				<Interactive.Div
					name="Venue"
					dir="auto"
					style={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					Main Stage
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};
