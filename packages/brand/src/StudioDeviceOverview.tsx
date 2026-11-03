import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const StudioDeviceOverviewContent = () => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const portrait = width < height;
	const portraitScale = (height * 0.86) / 1424;
	const halfDeviceWidth = (2240 * portraitScale) / 2;

	return (
		<Interactive.Div
			name={
				portrait
					? 'Studio device - pan left to right'
					: 'Studio device - slow zoom out'
			}
			style={{
				position: 'absolute',
				left: portrait
					? interpolate(
							frame,
							[0, durationInFrames - 1],
							[halfDeviceWidth + 32, width - halfDeviceWidth - 32],
							{
								easing: Easing.inOut(Easing.sin),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						)
					: '50%',
				top: portrait ? '50%' : '65%',
				translate: '-50% -50%',
				width: 2240,
				height: 1424,
				scale: portrait
					? portraitScale
					: Math.min(width / 2560, height / 1600) *
						interpolate(frame, [0, durationInFrames - 1], [1.13, 1.08], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
				// Match the device housing on the homepage.
				backgroundColor: '#101114',
				border: '2px solid #35373d',
				borderRadius: 48,
				boxSizing: 'border-box',
				boxShadow: '0 36px 80px rgba(0, 0, 0, 0.32)',
			}}
		>
			<Interactive.Div
				name="Studio device screen"
				style={{
					position: 'absolute',
					left: 30,
					top: 30,
					width: 2176,
					height: 1360,
					borderRadius: 20,
					overflow: 'hidden',
				}}
			>
				<Img
					name="Full Studio screenshot"
					src="https://remotion.media/timeline-reveal/after-2026-11-02-filmstrip-fixed-9548b256cf19.png"
					style={{width: '100%', height: '100%', objectFit: 'contain'}}
				/>
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const StudioDeviceOverview = Interactive.create({
	Component: StudioDeviceOverviewContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
