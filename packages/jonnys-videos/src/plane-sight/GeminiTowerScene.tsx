import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	CanvasImage,
	Interactive,
	type InteractiveTransformProps,
	Series,
	useVideoConfig,
} from 'remotion';

// Fill the canvas while retaining the recorded hover card in the center crop.
const mediaStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

const GeminiTowerSceneContent = ({style}: InteractiveTransformProps) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff', ...style}}>
			<Interactive.Div
				name="Close-up of Gemini in the control tower"
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					overflow: 'hidden',
					backgroundColor: '#6d9b57',
				}}
			>
				<Series name="Tower hover" layout="absolute-fill">
					<Series.Sequence
						name="Establish the control tower"
						durationInFrames={2 * fps}
					>
						<CanvasImage
							src={
								'https://remotion.media/jonnys-videos/plane-sight/screenshots/gemini-tower-before-hover.png'
							}
							style={mediaStyle}
						/>
					</Series.Sequence>
					<Series.Sequence
						name="Reveal Gemini on the spoken name"
						durationInFrames={3 * fps}
					>
						<Video
							src={
								'https://remotion.media/jonnys-videos/plane-sight/scenes/gemini-tower-hover.mp4'
							}
							trimBefore={0}
							muted
							objectFit="cover"
							style={mediaStyle}
						/>
					</Series.Sequence>
					<Series.Sequence
						name="Hold Gemini's card through the priority explanation"
						durationInFrames={(224 / 30) * fps}
					>
						<CanvasImage
							src={
								'https://remotion.media/jonnys-videos/plane-sight/screenshots/gemini-tower-hover.png'
							}
							style={mediaStyle}
						/>
					</Series.Sequence>
				</Series>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const GeminiTowerScene = Interactive.create({
	Component: GeminiTowerSceneContent,
	componentName: 'GeminiTowerScene',
});
