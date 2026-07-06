import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const LowerThird: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const exitStart = Math.max(0, durationInFrames - 28);
	const exitEnd = Math.max(exitStart + 1, durationInFrames - 8);

	return (
		<AbsoluteFill
			style={{
				fontFamily: 'Inter, system-ui, sans-serif',
				pointerEvents: 'none',
			}}
		>
			<Interactive.Div
				name="Lower third position"
				style={{
					position: 'absolute',
					left: 140,
					bottom: 120,
					width: 680,
					opacity:
						interpolate(frame, [0, 18], [0, 1], {
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}) *
						interpolate(frame, [exitStart, exitEnd], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					translate: interpolate(frame, [0, 24], ['-72px 0px', '0px 0px'], {
						extrapolateRight: 'clamp',
						easing: Easing.spring({
							damping: 180,
							stiffness: 120,
						}),
					}),
					scale: interpolate(frame, [0, 22], [0.96, 1], {
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					}),
					transformOrigin: 'left bottom',
				}}
			>
				<Interactive.Div
					name="Lower third card"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 24,
						padding: 24,
						borderRadius: 24,
						backgroundColor: 'rgba(255, 255, 255, 0.94)',
						boxShadow: '0 6px 12px rgba(24, 24, 27, 0.2)',
						border: '1px solid rgba(24, 24, 27, 0.08)',
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
							letterSpacing: -1,
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
								fontWeight: 650,
								letterSpacing: -1.6,
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
							}}
						>
							Creative Developer
						</Interactive.Div>
					</div>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
