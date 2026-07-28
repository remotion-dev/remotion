import {linearTiming} from '@remotion/transitions';
import {pushCut} from '@remotion/transitions/push-cut';
import {SampleTransition} from '../transitions/previews';

export const PushCutDocsDemo: React.FC = () => {
	return (
		<SampleTransition
			durationRestThreshold={0.001}
			effect={pushCut()}
			firstSceneDurationInFrames={35}
			secondSceneDurationInFrames={36}
			transition={linearTiming({durationInFrames: 11})}
		/>
	);
};
