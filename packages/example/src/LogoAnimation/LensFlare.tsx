import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export const LensFlare: React.FC = () => {
	const frame = useCurrentFrame();

	// Trigger at frame 180 when logo fill completes
	const triggerFrame = 180;
	const duration = 40;

	const progress = interpolate(
		frame,
		[triggerFrame, triggerFrame + duration],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const scale = interpolate(progress, [0, 0.3, 1], [0, 1.5, 0]);
	const opacity = interpolate(progress, [0, 0.2, 0.5, 1], [0, 1, 0.5, 0]);

	if (frame < triggerFrame) {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				pointerEvents: 'none',
			}}
		>
			{/* Main burst */}
			<div
				style={{
					width: '600px',
					height: '600px',
					borderRadius: '50%',
					background:
						'radial-gradient(circle, rgba(167, 139, 250, 0.8) 0%, rgba(124, 58, 237, 0.4) 30%, transparent 70%)',
					transform: `scale(${scale})`,
					opacity,
					filter: 'blur(40px)',
				}}
			/>

			{/* Secondary glow */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: `translate(-50%, -50%) scale(${scale * 0.7})`,
					width: '400px',
					height: '400px',
					borderRadius: '50%',
					background:
						'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(167, 139, 250, 0.3) 50%, transparent 70%)',
					opacity: opacity * 0.8,
					filter: 'blur(20px)',
				}}
			/>

			{/* Lens flare rays */}
			{[0, 45, 90, 135].map((angle) => (
				<div
					key={angle}
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '2px',
						height: `${400 * scale}px`,
						background:
							'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6), transparent)',
						transform: `translate(-50%, -50%) rotate(${angle}deg)`,
						opacity: opacity * 0.6,
					}}
				/>
			))}
		</div>
	);
};
