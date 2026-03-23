import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const PADDING = 70;

export const LowerReference: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const entry = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});

	return (
		<AbsoluteFill
			style={{
				padding: PADDING,
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					fontFamily: 'SF Pro',
					padding: '40px 70px',
					fontSize: 70,
					bottom: PADDING,
					borderRadius: 25,
					boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
					transform: `translateY(${interpolate(
						entry,
						[0, 1],
						[400, 0]
					)}px) rotateZ(${interpolate(entry, [0, 1], [Math.PI * 0.05, 0])}rad)`,
				}}
			>
				<div
					style={{
						fontWeight: 'bolder',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<svg
						style={{
							width: 80,
						}}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 576 512"
					>
						<path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
					</svg>
					<div style={{width: 30}} />
					How to animate anything in a circle
				</div>
			</div>
		</AbsoluteFill>
	);
};
