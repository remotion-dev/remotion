import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const TimelineRevealLayers = ({
	revealDurationInSeconds,
	fadeOut,
}: {
	readonly revealDurationInSeconds: number;
	readonly fadeOut: boolean;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Keep the ruler and everything above the first track on the static image.
	const timelineTop = 2515;
	const revealX = interpolate(
		frame,
		[0, revealDurationInSeconds * fps],
		[1350, 6400],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.linear,
		},
	);

	return (
		<>
			<Img
				name="Before"
				src="https://remotion.media/timeline-reveal/before-2026-11-02-fe42182c5870.png"
				premountFor={fps}
				style={{
					position: 'absolute',
					width: 6400,
					maxWidth: 'none',
					height: 4000,
				}}
			/>
			<Img
				name="After"
				src="https://remotion.media/timeline-reveal/after-2026-11-02-filmstrip-fixed-9548b256cf19.png"
				premountFor={fps}
				cropTop={timelineTop / 4000}
				cropRight={1 - revealX / 6400}
				style={{
					position: 'absolute',
					width: 6400,
					maxWidth: 'none',
					height: 4000,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: timelineTop,
					width: '100%',
					height: 4000 - timelineTop,
					overflow: 'hidden',
				}}
			>
				<Interactive.Div
					name="Dark reveal pass"
					style={{
						position: 'absolute',
						top: -timelineTop,
						width: 320,
						height: 4000,
						overflow: 'hidden',
						pointerEvents: 'none',
						left: 0,
						translate: `${revealX - 160}px 0px`,
						opacity: interpolate(
							frame,
							[
								0,
								(revealDurationInSeconds - 0.6) * fps,
								revealDurationInSeconds * fps,
							],
							[1, 1, fadeOut ? 0 : 1],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						background:
							'linear-gradient(to right, rgba(21, 23, 25, 0) 0%, rgba(21, 23, 25, 0.2) 25%, rgba(21, 23, 25, 0.65) 50%, rgba(21, 23, 25, 0.2) 75%, rgba(21, 23, 25, 0) 100%)',
					}}
				>
					<Interactive.Div
						name="Timeline background seam"
						style={{
							position: 'absolute',
							left: 160,
							top: 0,
							width: 15,
							height: '100%',
							translate: '-7.5px 0px',
							// Match the background in the captured timeline screenshots.
							backgroundColor: '#151719',
							boxShadow:
								'0 0 25px 7.5px rgba(21, 23, 25, 0.8), 0 0 65px 17.5px rgba(21, 23, 25, 0.24)',
						}}
					/>
				</Interactive.Div>
			</div>
		</>
	);
};

const TimelineLayoutRevealContent = () => {
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
					width: 6400,
					height: 4000,
					left: '50%',
					top: '50%',
					translate: interpolate(
						frame,
						[0, 11 * fps],
						['-1280px -3160px', '-3200px -2000px'],
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
						[0.74, 0.4],
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
					boxShadow: '0 100px 250px rgba(0, 0, 0, 0.5)',
				}}
			>
				<TimelineRevealLayers revealDurationInSeconds={11} fadeOut />
			</Interactive.Div>
		</div>
	);
};

export const TimelineLayoutReveal = Interactive.create({
	Component: TimelineLayoutRevealContent,
	layout: 'absolute-fill',
	schema: {},
});
