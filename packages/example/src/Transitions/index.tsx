import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const BasicTransition: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const spr = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<AbsoluteFill
					style={{
						backgroundColor: 'orange',
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition />
			<TransitionSeries.Sequence durationInFrames={60}>
				<AbsoluteFill
					style={{
						backgroundColor: 'green',
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition />
			<TransitionSeries.Sequence durationInFrames={60}>
				<AbsoluteFill
					style={{
						backgroundColor: 'red',
					}}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
