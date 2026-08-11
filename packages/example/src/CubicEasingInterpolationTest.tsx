import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const CubicEasingInterpolationTest: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: 'white',
				justifyContent: 'center',
			}}
		>
			<Sequence
				durationInFrames={120}
				name="Easing.cubic keyframes should be shown at 0 and 100"
				style={{
					scale: interpolate(frame, [0, 100], [0.4, 1.6], {
						easing: Easing.cubic,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div
					style={{
						backgroundColor: '#0b84f3',
						borderRadius: 24,
						height: 220,
						width: 220,
					}}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};

export default CubicEasingInterpolationTest;
