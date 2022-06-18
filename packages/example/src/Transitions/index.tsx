import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';

export const BasicTransition: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'orange',
						opacity: 0.5,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={{
					type: 'timing',
					duration: 30,
				}}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'green',
						opacity: 0.5,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={{
					type: 'spring',
					config: {},
				}}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'blue',
						opacity: 0.5,
					}}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
