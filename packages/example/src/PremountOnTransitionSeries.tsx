import {TransitionSeries} from '@remotion/transitions';
import {Sequence, Video} from 'remotion';

// test case: Nested sequences should be considered premounted
export const PremountOnTransitionSeries = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={200}>
				hi
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence durationInFrames={100} premountFor={150}>
				<Sequence>
					<Sequence>
						<Video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
					</Sequence>
				</Sequence>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
