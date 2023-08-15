import {
	makeLinearTiming,
	makeSpringTiming,
	makeWipePresentation,
	TransitionSeries,
} from '@remotion/transitions';
import {AbsoluteFill, Easing} from 'remotion';

export const BasicTransition: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'orange',
						opacity: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 200,
						color: 'white',
					}}
				>
					A
				</AbsoluteFill>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeWipePresentation({origin: 'from-bottom-left'})}
				timing={makeLinearTiming({
					durationInFrames: 30,
					easing: Easing.bounce,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'green',
						opacity: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 200,
						color: 'white',
					}}
				>
					B
				</AbsoluteFill>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeWipePresentation({origin: 'from-left'})}
				timing={makeSpringTiming({
					config: {
						damping: 200,
					},
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<AbsoluteFill
					style={{
						backgroundColor: 'blue',
						opacity: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 200,
						color: 'white',
					}}
				>
					C
				</AbsoluteFill>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
