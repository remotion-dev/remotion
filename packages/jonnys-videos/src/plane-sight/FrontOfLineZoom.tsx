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

const FrontOfLineZoomContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<CanvasImage
				name="Priority one — the plane at the front of the line"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport.png'
				}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					imageRendering: 'pixelated',
					transformOrigin: '64% 62%',
					scale: interpolate(
						frame,
						[0, 0.8 * fps, 2.35 * fps, 3 * fps],
						[1, 2.4, 2.4, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.3, 1),
							output: 'perceptual-scale',
						},
					),
					translate: interpolate(
						frame,
						[0, 0.8 * fps, 2.35 * fps, 3 * fps],
						['0px 0px', '-150px -80px', '-150px -80px', '0px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.3, 1),
						},
					),
				}}
			/>
		</AbsoluteFill>
	);
};

export const FrontOfLineZoom = Interactive.create({
	Component: FrontOfLineZoomContent,
	componentName: 'FrontOfLineZoom',
});
