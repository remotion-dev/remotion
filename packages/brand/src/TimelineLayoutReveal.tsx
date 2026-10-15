import {
	CanvasImage,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const TimelineLayoutReveal = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<>
			<CanvasImage
				name="Before"
				src={staticFile('timeline-reveal/before.png')}
				premountFor={fps}
				style={{position: 'absolute', width: '100%', height: '100%'}}
			/>
			<CanvasImage
				name="After"
				src={staticFile('timeline-reveal/after.png')}
				premountFor={fps}
				cropRight={interpolate(frame, [1.2 * fps, 3.8 * fps], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.65, 0, 0.35, 1),
				})}
				style={{position: 'absolute', width: '100%', height: '100%'}}
			/>
		</>
	);
};
