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

const AirportSignZoomContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const zoom = interpolate(
		frame,
		[0, 1.5 * fps, (175 / 30) * fps, (219 / 30) * fps],
		[1, 2.6, 2.6, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.42, 0, 0.3, 1),
		},
	);

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<CanvasImage
				name="Zoom into the Agent Airport International sign"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/screenshots/herdr-terminal-airport.png'
				}
				premountFor={fps}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transformOrigin: '50% 18%',
					scale: zoom,
					translate: `${-60 * (zoom - 1)}px ${100 * (zoom - 1)}px`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const AirportSignZoom = Interactive.create({
	Component: AirportSignZoomContent,
	componentName: 'AirportSignZoom',
});
