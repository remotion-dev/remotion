import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const StudioScreenshotRattleContent = () => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Steady screenshot push in"
			style={{
				position: 'absolute',
				top: '50%',
				width: '100%',
				height: width < height ? (width * 1600) / 2560 : '100%',
				translate: '0 -50%',
				transformOrigin: '55% 73%',
				scale: interpolate(frame, [0, durationInFrames - 1], [1, 1.04], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					output: 'perceptual-scale',
				}),
			}}
		>
			<Img
				name="Full Studio screenshot - six snare zoom steps"
				src="https://remotion.media/timeline-reveal/after-2026-11-02-filmstrip-fixed-9548b256cf19.png"
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					transformOrigin: '55% 73%',
					// Six measured snare hits, each four frames apart at 30 fps.
					scale: interpolate(
						frame,
						[
							0,
							(4 / 30) * fps,
							(8 / 30) * fps,
							(12 / 30) * fps,
							(16 / 30) * fps,
							(20 / 30) * fps,
						],
						[1, 1.3, 1.7, 2.2, 2.8, 3.5],
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
				}}
			/>
		</Interactive.Div>
	);
};

export const StudioScreenshotRattle = Interactive.create({
	Component: StudioScreenshotRattleContent,
	layout: 'absolute-fill',
	schema: {},
});
