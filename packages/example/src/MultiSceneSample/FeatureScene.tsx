import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const FeatureScene: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#f97316',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Interactive.Div
				name="Feature card"
				style={{
					backgroundColor: '#fff7ed',
					borderRadius: 36,
					color: '#7c2d12',
					fontFamily: 'Arial, sans-serif',
					fontSize: 88,
					fontWeight: 700,
					padding: '54px 72px',
					scale: interpolate(frame, [0, 24], [0.8, 1], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				Three editable scenes.
			</Interactive.Div>
		</AbsoluteFill>
	);
};
