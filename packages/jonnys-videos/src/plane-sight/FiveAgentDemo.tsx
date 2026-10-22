import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	type InteractiveTransformProps,
	interpolate,
	Series,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const screenStyle: React.CSSProperties = {
	position: 'absolute',
	left: 32,
	top: 32,
	width: 944,
	height: (944 * 1484) / 2702,
	overflow: 'hidden',
	borderRadius: 10,
	backgroundColor: '#151410',
	boxShadow: '0 12px 36px rgba(21, 31, 44, 0.12)',
};

const fullscreenStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	overflow: 'hidden',
	backgroundColor: '#151410',
};

const fullscreenMediaStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

// The five-agent sidebar is taken from source 00:24, before the airport switch.
const FiveAgentsIntroContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#000000', ...style}}>
			<Interactive.Div
				name="Focus on the five waiting sessions"
				style={{
					...screenStyle,
					left: interpolate(frame, [0.9 * fps, 2.5 * fps], [32, 204], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
					}),
					width: interpolate(frame, [0.9 * fps, 2.5 * fps], [944, 600], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.3, 1),
					}),
					opacity: interpolate(
						frame,
						[0, 0.2 * fps, 7.8 * fps, 8.1 * fps],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<CanvasImage
					name="Herdr at source 00:24 — five agents"
					src={
						'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agents-herdr.png'
					}
					style={{
						position: 'absolute',
						width: 944,
						height: (944 * 1484) / 2702,
						transformOrigin: '0 0',
						scale: interpolate(frame, [0.9 * fps, 2.5 * fps], [1, 2.6], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.3, 1),
							output: 'perceptual-scale',
						}),
						translate: interpolate(
							frame,
							[0.9 * fps, 2.5 * fps],
							['0px 0px', '-12px -726px'],
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

export const FiveAgentsIntro = Interactive.create({
	Component: FiveAgentsIntroContent,
	componentName: 'FiveAgentsIntro',
});

const AirportOverviewContent = ({style}: InteractiveTransformProps) => {
	return (
		<AbsoluteFill style={style}>
			<Interactive.Div
				name="Five-agent airport overview"
				style={fullscreenStyle}
			>
				<CanvasImage
					name="Authentication first, API next — source 00:00.3"
					src={
						'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport.png'
					}
					style={fullscreenMediaStyle}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const AirportOverview = Interactive.create({
	Component: AirportOverviewContent,
	componentName: 'AirportOverview',
});

const AirportDemoContent = ({style}: InteractiveTransformProps) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={style}>
			<Interactive.Div name="Recorded airport demo" style={fullscreenStyle}>
				<Interactive.Div
					name="Agents taking off — zoom into the runway"
					style={{
						position: 'absolute',
						inset: 0,
						transformOrigin: '75% 67%',
						scale: interpolate(
							frame,
							[(86 / 30) * fps, (110 / 30) * fps, 5.6 * fps, (181 / 30) * fps],
							[1, 2.2, 2.2, 1],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.3, 1),
								output: 'perceptual-scale',
							},
						),
						translate: interpolate(
							frame,
							[(86 / 30) * fps, (110 / 30) * fps, 5.6 * fps, (181 / 30) * fps],
							['0px 0px', '-160px -85px', '-160px -85px', '0px 0px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.3, 1),
							},
						),
					}}
				>
					<Series name="Airport action" layout="absolute-fill">
						<Series.Sequence
							name="Five agents in priority order"
							durationInFrames={3.4 * fps}
						>
							<CanvasImage
								src={
									'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport.png'
								}
								style={fullscreenMediaStyle}
							/>
						</Series.Sequence>
						<Series.Sequence
							name="Send an agent off — source 00:26.5"
							durationInFrames={2.3 * fps}
						>
							<Video
								src={
									'https://remotion.media/jonnys-videos/plane-sight/scenes/five-agent-demo.mp4'
								}
								trimBefore={26.5 * fps}
								muted
								objectFit="cover"
								style={fullscreenMediaStyle}
							/>
						</Series.Sequence>
						<Series.Sequence
							name="Working agent is hidden"
							durationInFrames={(10 / 30) * fps}
						>
							<CanvasImage
								src={
									'https://remotion.media/jonnys-videos/plane-sight/screenshots/four-agents-airport.png'
								}
								style={fullscreenMediaStyle}
							/>
						</Series.Sequence>
						<Series.Sequence
							name="Agent returns to the queue — source 00:38.5"
							durationInFrames={4.1 * fps}
						>
							<Video
								src={
									'https://remotion.media/jonnys-videos/plane-sight/scenes/five-agent-demo.mp4'
								}
								trimBefore={38.5 * fps}
								muted
								objectFit="cover"
								style={fullscreenMediaStyle}
							/>
						</Series.Sequence>
						<Series.Sequence
							name="Hold the airport for the turnaround line"
							durationInFrames={6.4 * fps}
						>
							<CanvasImage
								src={
									'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport-returned.png'
								}
								style={fullscreenMediaStyle}
							/>
						</Series.Sequence>
					</Series>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const AirportDemo = Interactive.create({
	Component: AirportDemoContent,
	componentName: 'AirportDemo',
});
