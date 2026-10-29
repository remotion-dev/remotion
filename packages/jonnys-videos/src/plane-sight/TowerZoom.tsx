import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	type InteractiveTransformProps,
	type InteractivitySchema,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type TowerZoomProps = InteractiveTransformProps & {
	readonly afterHerdr: boolean;
};

const TowerZoomContent = ({style, afterHerdr}: TowerZoomProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<CanvasImage
				name="Air traffic controller — focus on the tower"
				src={
					afterHerdr
						? 'https://remotion.media/jonnys-videos/plane-sight/screenshots/herdr-terminal-airport.png'
						: 'https://remotion.media/jonnys-videos/plane-sight/screenshots/five-agent-airport.png'
				}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					imageRendering: 'pixelated',
					transformOrigin: '82% 34%',
					scale: interpolate(
						frame,
						[0, 0.9 * fps, 1.5 * fps, (61 / 30) * fps],
						[1, 3.2, 3.2, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.3, 1),
							output: 'perceptual-scale',
						},
					),
					translate: interpolate(
						frame,
						[0, 0.9 * fps, 1.5 * fps, (61 / 30) * fps],
						['0px 0px', '-341px 79px', '-341px 79px', '0px 0px'],
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

export const TowerZoom = Interactive.create({
	Component: TowerZoomContent,
	componentName: 'TowerZoom',
	schema: {
		afterHerdr: {
			type: 'boolean',
			default: false,
			description: 'Use the airport after the Herdr handoff',
		},
	} satisfies InteractivitySchema,
});
