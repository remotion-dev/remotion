import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const HelloWorld: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// Fade in during first 30 frames
	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// Scale animation
	const scale = interpolate(frame, [0, 30], [0.5, 1], {
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#1a1a2e',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					color: 'white',
					fontSize: 100,
					fontWeight: 'bold',
					fontFamily: 'sans-serif',
					textAlign: 'center',
				}}
			>
				Hello World
			</div>
		</AbsoluteFill>
	);
};
