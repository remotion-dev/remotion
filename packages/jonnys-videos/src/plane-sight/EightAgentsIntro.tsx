import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const EightAgentsIntroContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={style}>
			<Interactive.Div
				name="Screenshot focus window"
				premountFor={fps}
				style={{
					position: 'absolute',
					top: 32,
					left: interpolate(frame, [1.3 * fps, 3.5 * fps], [280, 440], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
					}),
					width: interpolate(frame, [1.3 * fps, 3.5 * fps], [720, 400], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
					}),
					height: interpolate(frame, [1.3 * fps, 3.5 * fps], [405, 520], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
					}),
					borderRadius: 10,
					overflow: 'hidden',
					backgroundColor: '#11100e',
					boxShadow: '0 12px 36px rgba(21, 31, 44, 0.12)',
					opacity: interpolate(
						frame,
						[0, 0.25 * fps, 7.75 * fps, 8.1 * fps],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<CanvasImage
					name="Eight agents — Herdr web UI zoom"
					src={
						'https://remotion.media/jonnys-videos/plane-sight/screenshots/eight-agents-herdr-web.jpg'
					}
					premountFor={fps}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 720,
						height: 405,
						transformOrigin: '0 0',
						scale: interpolate(frame, [1.3 * fps, 3.5 * fps], [1, 20 / 9], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.3, 1),
							output: 'perceptual-scale',
						}),
						translate: interpolate(
							frame,
							[1.3 * fps, 3.5 * fps],
							['0px 0px', '0px -62.5px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.3, 1),
							},
						),
					}}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const EightAgentsIntro = Interactive.create({
	Component: EightAgentsIntroContent,
	componentName: 'EightAgentsIntro',
});
