import {TransitionSeries} from '@remotion/transitions';
import {ClosingScene} from './ClosingScene';
import {FeatureScene} from './FeatureScene';
import {OpeningScene} from './OpeningScene';

export const MultiSceneVideo: React.FC = () => {
	return (
		<>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={90}>
					<OpeningScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence durationInFrames={90}>
					<FeatureScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence durationInFrames={90}>
					<ClosingScene />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
