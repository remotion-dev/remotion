import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const LowerThird: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps: videoFps} = useVideoConfig();

	const entrance = spring({
		frame,
		fps: videoFps,
		config: {
			damping: 18,
			stiffness: 120,
		},
	});

	const exitStart = Math.max(0, durationInFrames - 25);
	const exitEnd = Math.max(exitStart + 1, durationInFrames - 5);

	const exit = interpolate(frame, [exitStart, exitEnd], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const progress = entrance * exit;

	return (
		<AbsoluteFill
			style={{
				fontFamily: 'Inter, system-ui, sans-serif',
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 0,
					bottom: 0,
					transform: `translateX(${interpolate(progress, [0, 1], [-90, 0])}px)`,
					opacity: progress,
				}}
			>
				<div
					style={{
						width: 660,
						padding: '34px 42px',
						borderRadius: 28,
						background: 'rgba(255, 255, 255, 0.92)',
						boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
					}}
				>
					<div
						style={{
							fontSize: 54,
							fontWeight: 800,
							color: '#111827',
							letterSpacing: -1.5,
						}}
					>
						Alex Morgan
					</div>
					<div
						style={{
							fontSize: 30,
							fontWeight: 600,
							color: '#2563eb',
							marginTop: 10,
						}}
					>
						Creative Developer
					</div>
				</div>
				<div
					style={{
						width: interpolate(progress, [0, 1], [0, 520]),
						height: 10,
						borderRadius: 999,
						background: '#60a5fa',
						marginTop: 18,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
