import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const NLogo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Animation phases:
	// Frames 0-60 (0-1s): Logo scales in
	// Frames 30-120 (0.5-2s): Wireframe appears
	// Frames 90-180 (1.5-3s): Gradient fills in

	const scale = spring({
		frame: frame - 0,
		fps,
		config: {
			damping: 20,
			stiffness: 80,
		},
	});

	const strokeProgress = interpolate(frame, [30, 120], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const fillProgress = interpolate(frame, [90, 180], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const rotation = interpolate(frame, [0, 120], [0, 360], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				transform: `scale(${scale}) rotateY(${rotation}deg)`,
				transformStyle: 'preserve-3d',
			}}
		>
			<svg width="300" height="300" viewBox="0 0 300 300">
				<defs>
					<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#a78bfa" stopOpacity={fillProgress} />
						<stop offset="100%" stopColor="#7c3aed" stopOpacity={fillProgress} />
					</linearGradient>

					{/* Path for stroke animation */}
					<path
						id="nPath"
						d="M 60 240 L 60 60 L 90 60 L 210 180 L 210 60 L 240 60 L 240 240 L 210 240 L 90 120 L 90 240 Z"
					/>
				</defs>

				{/* Filled version with gradient */}
				<path
					d="M 60 240 L 60 60 L 90 60 L 210 180 L 210 60 L 240 60 L 240 240 L 210 240 L 90 120 L 90 240 Z"
					fill="url(#logoGradient)"
					stroke="none"
				/>

				{/* Wireframe outline */}
				<use
					href="#nPath"
					fill="none"
					stroke="#a78bfa"
					strokeWidth="3"
					strokeDasharray="1000"
					strokeDashoffset={1000 * (1 - strokeProgress)}
					style={{
						filter: 'drop-shadow(0 0 8px #a78bfa)',
					}}
				/>
			</svg>
		</div>
	);
};
