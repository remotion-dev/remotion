import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';

export const CanvasCaptureAnnouncement: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<TransitionSeries name="Canvas Capture announcement timeline">
				<TransitionSeries.Sequence name="Take 1" durationInFrames={217}>
					<Video
						name="Take 1"
						src="https://remotion.media/canvas-capture-announcement/camo-01.mov"
						trimBefore={58}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 2" durationInFrames={386}>
					<Video
						name="Take 2"
						src="https://remotion.media/canvas-capture-announcement/camo-02.mov"
						trimBefore={132}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 3" durationInFrames={403}>
					<Video
						name="Take 3"
						src="https://remotion.media/canvas-capture-announcement/camo-03.mov"
						trimBefore={76}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 4" durationInFrames={266}>
					<Video
						name="Take 4"
						src="https://remotion.media/canvas-capture-announcement/camo-04.mov"
						trimBefore={79}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 5" durationInFrames={611}>
					<Video
						name="Take 5"
						src="https://remotion.media/canvas-capture-announcement/camo-05.mov"
						trimBefore={85}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 6" durationInFrames={810}>
					<Video
						name="Take 6"
						src="https://remotion.media/canvas-capture-announcement/camo-06.mov"
						trimBefore={74}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 7" durationInFrames={477}>
					<Video
						name="Take 7"
						src="https://remotion.media/canvas-capture-announcement/camo-07.mov"
						trimBefore={49}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 8" durationInFrames={368}>
					<Video
						name="Take 8"
						src="https://remotion.media/canvas-capture-announcement/camo-08.mov"
						trimBefore={76}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 9" durationInFrames={170}>
					<Video
						name="Take 9"
						src="https://remotion.media/canvas-capture-announcement/camo-09.mov"
						trimBefore={80}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 10" durationInFrames={255}>
					<Video
						name="Take 10"
						src="https://remotion.media/canvas-capture-announcement/camo-10.mov"
						trimBefore={55}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 11" durationInFrames={297}>
					<Video
						name="Take 11"
						src="https://remotion.media/canvas-capture-announcement/camo-11.mov"
						trimBefore={73}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Take 12" durationInFrames={988}>
					<Video
						name="Take 12"
						src="https://remotion.media/canvas-capture-announcement/camo-12.mov"
						trimBefore={150}
						style={{width: '100%', height: '100%'}}
						objectFit="cover"
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
