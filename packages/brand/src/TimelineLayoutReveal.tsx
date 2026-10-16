import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const TimelineLayoutReveal = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#0b0e14',
				perspective: 2800,
			}}
		>
			<Interactive.Div
				name="Timeline camera"
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					left: '50%',
					top: '50%',
					translate: interpolate(
						frame,
						[0, 11 * fps],
						['-512px -1264px', '-1280px -800px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					transformOrigin: interpolate(
						frame,
						[0, 11 * fps],
						['20% 79%', '50% 50%'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[1.8666666666666667 * fps, 11 * fps],
						[1.85, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.42, 0, 0.58, 1)],
						},
					),
					rotate: interpolate(
						frame,
						[1.8666666666666667 * fps, 11 * fps],
						[
							'-0.204073 0.978913 0.009116 16.327895deg',
							'-0.204073 0.978913 0.009116 0deg',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.42, 0, 0.58, 1)],
						},
					),
					boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)',
				}}
			>
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
					cropRight={interpolate(frame, [0, 11 * fps], [0.8, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.linear,
					})}
					style={{position: 'absolute', width: '100%', height: '100%'}}
				/>
				<div
					style={{
						position: 'absolute',
						top: '58%',
						width: '100%',
						height: '42%',
						overflow: 'hidden',
					}}
				>
					<Interactive.Div
						name="Reveal seam"
						style={{
							position: 'absolute',
							top: -928,
							width: 128,
							height: 1600,
							overflow: 'hidden',
							pointerEvents: 'none',
							left: 0,
							translate: interpolate(
								frame,
								[0, 11 * fps],
								['448px 0px', '2496px 0px'],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: Easing.linear,
								},
							),
							opacity: interpolate(frame, [10.4 * fps, 11 * fps], [1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							background:
								'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.6) 0%, rgba(219, 224, 232, 0.22) 35%, transparent 70%)',
						}}
					>
						<Interactive.Div
							name="Metallic core"
							style={{
								position: 'absolute',
								left: 64,
								top: 0,
								width: 6,
								height: '100%',
								translate: '-3px 0px',
								background:
									'linear-gradient(to right, #9da5b0, #e1e5ea 20%, #ffffff 45%, #ffffff 60%, #b5bdc9 82%, #f3f5f8)',
								boxShadow:
									'0 0 10px 3px rgba(255, 255, 255, 0.95), 0 0 26px 7px rgba(232, 236, 242, 0.65), 0 0 60px 12px rgba(214, 221, 231, 0.22)',
							}}
						/>
					</Interactive.Div>
				</div>
			</Interactive.Div>
		</div>
	);
};
