import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const PlaneSightLogoContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={style}>
			<CanvasImage
				name="Plane Sight logo"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/branding/plane-sight-logo.png'
				}
				premountFor={fps}
				style={{
					position: 'absolute',
					left: 220,
					top: 220,
					width: 840,
					height: 280,
					objectFit: 'contain',
					imageRendering: 'pixelated',
					transformOrigin: '50% 50%',
					scale: interpolate(frame, [0, 4 * fps], [0.94, 1.06], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export const PlaneSightLogo = Interactive.create({
	Component: PlaneSightLogoContent,
	componentName: 'PlaneSightLogo',
});
