import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Interactive,
	useVideoConfig,
} from 'remotion';

const AgentAirportSignContent = ({style}: InteractiveTransformProps) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={style}>
			<CanvasImage
				name="Agent Airport International — AAI"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/branding/agent-airport-international.png'
				}
				premountFor={fps}
				style={{
					position: 'absolute',
					left: 40,
					top: 120,
					width: 1200,
					height: 480,
					objectFit: 'contain',
					imageRendering: 'pixelated',
				}}
			/>
		</AbsoluteFill>
	);
};

export const AgentAirportSign = Interactive.create({
	Component: AgentAirportSignContent,
	componentName: 'AgentAirportSign',
});
