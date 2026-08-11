import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const ClosingScene: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#ecfdf5',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Interactive.Div
				name="Closing title"
				style={{
					color: '#065f46',
					fontFamily: 'Arial, sans-serif',
					fontSize: 104,
					fontWeight: 700,
					letterSpacing: -4,
					opacity: interpolate(frame, [0, 18, 70, 89], [0, 1, 1, 0], {
						easing: [
							Easing.bezier(0.16, 1, 0.3, 1),
							Easing.linear,
							Easing.bezier(0.7, 0, 0.84, 0),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				Ready to remix.
			</Interactive.Div>
		</AbsoluteFill>
	);
};
