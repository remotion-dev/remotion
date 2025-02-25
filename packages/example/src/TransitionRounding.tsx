import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const durations: number[] = [3.000002, 4];

// this should never show 2 sequences at once
// https://github.com/remotion-dev/remotion/issues/4922
export const TransitionRounding: React.FC = () => {
	const currentFrame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<TransitionSeries>
				{durations.map((duration, index) => (
					<TransitionSeries.Sequence durationInFrames={duration}>
						<AbsoluteFill
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<h1
								style={{
									fontSize: 100,
									marginTop: index * 150,
								}}
							>
								Sequence {index}, Frame {currentFrame}
							</h1>
						</AbsoluteFill>
					</TransitionSeries.Sequence>
				))}
			</TransitionSeries>
		</AbsoluteFill>
	);
};
