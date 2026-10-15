import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	type InteractiveTransformProps,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const TaxiwayDependenciesContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<CanvasImage
				name="Zoom into the taxiway dependency queue"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport.png'
				}
				premountFor={fps}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transformOrigin: '52% 52%',
					scale: interpolate(frame, [0, 1.5 * fps], [1, 1.85], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
						output: 'perceptual-scale',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export const TaxiwayDependencies = Interactive.create({
	Component: TaxiwayDependenciesContent,
	componentName: 'TaxiwayDependencies',
});
