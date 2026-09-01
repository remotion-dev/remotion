import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const OpeningScene: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111827',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Interactive.Div
				name="Opening title"
				style={{
					color: '#f9fafb',
					fontFamily: 'Arial, sans-serif',
					fontSize: 112,
					fontWeight: 700,
					letterSpacing: -5,
					opacity: interpolate(frame, [0, 20], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(frame, [0, 20], ['0px 60px', '0px 0px'], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				One video.
			</Interactive.Div>
		</AbsoluteFill>
	);
};
