import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export const BasicTransition: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

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
					type: 'spring',
					config: {
						damping: 200,
					},
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
			<TransitionSeries.Sequence durationInFrames={50}>
				<AbsoluteFill
					style={{
						backgroundColor: 'red',
						opacity: 0.5,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={{
					type: 'spring',
					config: {
						mass: 3,
					},
				}}
			/>
			<TransitionSeries.Sequence durationInFrames={900}>
				<AbsoluteFill
					style={{
						backgroundColor: 'yellow',
						opacity: 0.5,
					}}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
