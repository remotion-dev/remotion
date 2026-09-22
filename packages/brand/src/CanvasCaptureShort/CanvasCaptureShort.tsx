import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';

export const CanvasCaptureShort: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<TransitionSeries name="Canvas Capture short timeline">
				<TransitionSeries.Sequence name="Short 1" durationInFrames={125}>
					<Video
						name="Short 1"
						src="https://remotion.media/canvas-capture-short/short-01.mov"
						premountFor={30}
						trimBefore={37}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Short 2" durationInFrames={194}>
					<Video
						name="Short 2"
						src="https://remotion.media/canvas-capture-short/short-02.mov"
						premountFor={30}
						trimBefore={69}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Short 3" durationInFrames={255}>
					<Video
						name="Short 3"
						src="https://remotion.media/canvas-capture-short/short-03.mov"
						premountFor={30}
						trimBefore={71}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Short 4" durationInFrames={158}>
					<Video
						name="Short 4"
						src="https://remotion.media/canvas-capture-short/short-04.mov"
						premountFor={30}
						trimBefore={65}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Short 5" durationInFrames={271}>
					<Video
						name="Short 5"
						src="https://remotion.media/canvas-capture-short/short-05.mov"
						premountFor={30}
						trimBefore={62}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Short 6" durationInFrames={247}>
					<Video
						name="Short 6"
						src="https://remotion.media/canvas-capture-short/short-06.mov"
						premountFor={30}
						trimBefore={80}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '50%',
						}}
						objectFit="cover"
						objectPosition="center center"
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
